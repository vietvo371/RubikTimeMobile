import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(false);
SQLite.enablePromise(true);

let db = null;
let isInitialized = false;

export const getDatabase = async () => {
    if (!db) {
        db = await SQLite.openDatabase({
            name: 'RubikTimer.db',
            location: 'default'
        });
    }
    return db;
};

export const initDatabase = async () => {
    try {
        if (isInitialized) {
            return true;
        }

        const database = await getDatabase();
        
        // Bắt đầu transaction để đảm bảo tính nhất quán
        await database.executeSql('BEGIN TRANSACTION');

        try {
            // Tạo bảng times với index để tối ưu query
            await database.executeSql(
                `CREATE TABLE IF NOT EXISTS times (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    time TEXT NOT NULL,
                    created_at TEXT DEFAULT (datetime('now','localtime'))
                );`
            );

            // Tạo index cho created_at để tối ưu ORDER BY
            await database.executeSql(
                `CREATE INDEX IF NOT EXISTS idx_times_created_at ON times(created_at DESC);`
            );

            // Tạo bảng settings với cấu trúc rõ ràng hơn
            await database.executeSql(
                `CREATE TABLE IF NOT EXISTS settings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    numAvg INTEGER NOT NULL DEFAULT 5,
                    numSubCount INTEGER NOT NULL DEFAULT 15,
                    isSoundOn INTEGER NOT NULL DEFAULT 1,
                    created_at TEXT DEFAULT (datetime('now','localtime'))
                );`
            );

            // Kiểm tra và thêm settings mặc định nếu bảng trống
            const [result] = await database.executeSql('SELECT COUNT(*) as count FROM settings');
            if (result.rows.item(0).count === 0) {
                await database.executeSql(
                    'INSERT INTO settings (numAvg, numSubCount, isSoundOn) VALUES (?, ?, ?)',
                    [5, 15, 1]
                );
            }

            // Commit transaction nếu mọi thứ OK
            await database.executeSql('COMMIT');
            
            isInitialized = true;
            return true;
        } catch (innerError) {
            // Rollback nếu có lỗi
            await database.executeSql('ROLLBACK');
            console.error('Database initialization error (inner):', innerError);
            throw innerError;
        }
    } catch (error) {
        console.error('Database initialization error:', error);
        // Reset trạng thái
        isInitialized = false;
        settingsCache = null;
        settingsCacheTime = 0;
        throw error;
    }
};

const checkTableExists = async (tableName) => {
    try {
        const database = await getDatabase();
        const [result] = await database.executeSql(
            `SELECT name FROM sqlite_master WHERE type='table' AND name=?;`,
            [tableName]
        );
        return result.rows.length > 0;
    } catch (error) {
        console.error(`Error checking table ${tableName}:`, error);
        return false;
    }
};

// Tối ưu getTimes với pagination
export const getTimes = async (limit = null, offset = 0) => {
    try {
        await initDatabase();
        const exists = await checkTableExists('times');
        if (!exists) {
            await initDatabase();
        }

        const database = await getDatabase();
        
        let query = 'SELECT * FROM times ORDER BY created_at DESC';
        let params = [];
        
        if (limit !== null) {
            query += ' LIMIT ? OFFSET ?';
            params = [limit, offset];
        }

        const [results] = await database.executeSql(query, params);

        return Array.from({ length: results.rows.length }, (_, i) => ({
            ...results.rows.item(i),
            id: results.rows.item(i).id,
            time: results.rows.item(i).time
        }));
    } catch (error) {
        console.error('Error getting times:', error);
        throw error;
    }
};

// Thêm hàm để lấy tổng số records
export const getTimesCount = async () => {
    try {
        await initDatabase();
        const database = await getDatabase();
        const [result] = await database.executeSql('SELECT COUNT(*) as count FROM times');
        return result.rows.item(0).count;
    } catch (error) {
        console.error('Error getting times count:', error);
        return 0;
    }
};

// Tối ưu saveTime với batch insert
export const saveTime = async (time) => {
    try {
        await initDatabase();
        if (!time) {
            throw new Error('Time is required');
        }

        const database = await getDatabase();
        const currentTime = new Date().toISOString();

        const [result] = await database.executeSql(
            'INSERT INTO times (time, created_at) VALUES (?, ?)',
            [time, currentTime]
        );

        if (result.rowsAffected > 0) {
            return {
                id: result.insertId,
                time: time,
                created_at: currentTime
            };
        }
        throw new Error('Failed to save time');
    } catch (error) {
        console.error('Error saving time:', error);
        throw error;
    }
};

// Tối ưu deleteTime
export const deleteTime = async (id) => {
    try {
        const database = await getDatabase();
        const [result] = await database.executeSql(
            'DELETE FROM times WHERE id = ?',
            [id]
        );
        return result.rowsAffected > 0;
    } catch (error) {
        console.error('Error deleting time:', error);
        throw error;
    }
};

// Tối ưu deleteAllTimes với transaction
export const deleteAllTimes = async () => {
    try {
        const database = await getDatabase();
        await database.executeSql('BEGIN TRANSACTION');
        await database.executeSql('DELETE FROM times');
        await database.executeSql('COMMIT');
        return true;
    } catch (error) {
        console.error('Error deleting all times:', error);
        try {
            await database.executeSql('ROLLBACK');
        } catch (rollbackError) {
            console.error('Error rolling back transaction:', rollbackError);
        }
        throw error;
    }
};

// Tối ưu getSettings với cache
let settingsCache = null;
let settingsCacheTime = 0;
const CACHE_DURATION = 5000; // 5 seconds

export const getSettings = async () => {
    try {
        const now = Date.now();
        
        // Kiểm tra cache chỉ khi database đã được khởi tạo
        if (isInitialized && settingsCache && (now - settingsCacheTime) < CACHE_DURATION) {
            return settingsCache;
        }

        // Khởi tạo database nếu chưa
        if (!isInitialized) {
            await initDatabase();
        }

        const database = await getDatabase();

        // Kiểm tra bảng settings có tồn tại không
        const tableExists = await checkTableExists('settings');
        if (!tableExists) {
            throw new Error('Settings table does not exist');
        }

        const [result] = await database.executeSql(
            'SELECT numAvg, numSubCount, isSoundOn FROM settings ORDER BY id DESC LIMIT 1'
        );

        let settings;
        if (result.rows.length > 0) {
            const settingsData = result.rows.item(0);
            settings = {
                numAvg: Math.max(1, Math.min(12, parseInt(settingsData.numAvg) || 5)),
                numSubCount: Math.max(1, parseInt(settingsData.numSubCount) || 15),
                isSoundOn: Boolean(settingsData.isSoundOn)
            };
        } else {
            // Nếu không có dữ liệu, tạo settings mặc định
            settings = {
                numAvg: 5,
                numSubCount: 15,
                isSoundOn: true
            };
            
            // Lưu settings mặc định vào database
            await database.executeSql(
                'INSERT INTO settings (numAvg, numSubCount, isSoundOn) VALUES (?, ?, ?)',
                [settings.numAvg, settings.numSubCount, settings.isSoundOn ? 1 : 0]
            );
        }

        // Cập nhật cache chỉ khi mọi thứ thành công
        settingsCache = settings;
        settingsCacheTime = now;

        return settings;
    } catch (error) {
        console.error('Error getting settings:', error);
        
        // Reset cache nếu có lỗi
        settingsCache = null;
        settingsCacheTime = 0;
        
        // Trả về giá trị mặc định an toàn
        return {
            numAvg: 5,
            numSubCount: 15,
            isSoundOn: true
        };
    }
};

// Tối ưu saveSettings với cache invalidation
export const saveSettings = async (settings) => {
    try {
        await initDatabase();
        const database = await getDatabase();

        // Thêm bản ghi settings mới thay vì update
        await database.executeSql(
            'INSERT INTO settings (numAvg, numSubCount, isSoundOn) VALUES (?, ?, ?)',
            [
                parseInt(settings.numAvg),
                parseInt(settings.numSubCount),
                settings.isSoundOn ? 1 : 0
            ]
        );

        // Invalidate cache
        settingsCache = null;
        settingsCacheTime = 0;

        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        return false;
    }
};

// Thêm hàm để tối ưu database
export const optimizeDatabase = async () => {
    try {
        const database = await getDatabase();
        await database.executeSql('VACUUM');
        await database.executeSql('ANALYZE');
        return true;
    } catch (error) {
        console.error('Error optimizing database:', error);
        return false;
    }
};

export const resetDatabase = async () => {
    try {
        const database = await getDatabase();
        await database.executeSql('DROP TABLE IF EXISTS times;');
        await database.executeSql('DROP TABLE IF EXISTS settings;');
        await database.executeSql('DROP INDEX IF EXISTS idx_times_created_at;');
        
        // Reset cache
        settingsCache = null;
        settingsCacheTime = 0;
        
        await initDatabase();
        return true;
    } catch (error) {
        console.error('Error resetting database:', error);
        throw error;
    }
};

// Thêm hàm để tạo dữ liệu test
export const generateTestData = async (count = 500) => {
    try {
        const database = await getDatabase();
        await initDatabase();
        
        console.log(`Generating ${count} test records...`);
        
        // Batch insert để tối ưu performance
        const batchSize = 50;
        const batches = Math.ceil(count / batchSize);
        
        for (let i = 0; i < batches; i++) {
            const batch = [];
            const start = i * batchSize;
            const end = Math.min(start + batchSize, count);
            
            for (let j = start; j < end; j++) {
                // Tạo thời gian ngẫu nhiên từ 10 giây đến 5 phút
                const minutes = Math.floor(Math.random() * 5) + 1;
                const seconds = Math.floor(Math.random() * 60);
                const milliseconds = Math.floor(Math.random() * 1000);
                const time = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
                
                batch.push([time, new Date().toISOString()]);
            }
            
            // Batch insert
            const placeholders = batch.map(() => '(?, ?)').join(',');
            const values = batch.flat();
            
            await database.executeSql(
                `INSERT INTO times (time, created_at) VALUES ${placeholders}`,
                values
            );
            
            if ((i + 1) % 5 === 0) {
                console.log(`Inserted ${(i + 1) * batchSize} records...`);
            }
        }
        
        console.log(`Generated ${count} test records successfully!`);
        return true;
    } catch (error) {
        console.error('Error generating test data:', error);
        throw error;
    }
};
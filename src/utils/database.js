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
        
        // Tạo bảng times
        await database.executeSql(
            `CREATE TABLE IF NOT EXISTS times (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                time TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now','localtime'))
            );`
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

        isInitialized = true;
        return true;
    } catch (error) {
        console.error('Database initialization error:', error);
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

export const getTimes = async () => {
    try {
        await initDatabase();
        const exists = await checkTableExists('times');
        if (!exists) {
            await initDatabase();
        }

        const database = await getDatabase();
        const [results] = await database.executeSql(
            'SELECT * FROM times ORDER BY created_at DESC'
        );

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

export const deleteAllTimes = async () => {
    try {
        const database = await getDatabase();
        await database.executeSql('DELETE FROM times');
        return true;
    } catch (error) {
        console.error('Error deleting all times:', error);
        throw error;
    }
};

export const getSettings = async () => {
    try {
        await initDatabase();
        const database = await getDatabase();

        const [result] = await database.executeSql(
            'SELECT numAvg, numSubCount, isSoundOn FROM settings ORDER BY id DESC LIMIT 1'
        );

        if (result.rows.length > 0) {
            const settings = result.rows.item(0);
            return {
                numAvg: parseInt(settings.numAvg),
                numSubCount: parseInt(settings.numSubCount),
                isSoundOn: Boolean(settings.isSoundOn)
            };
        }

        // Nếu không có dữ liệu, trả về giá trị mặc định
        return {
            numAvg: 5,
            numSubCount: 15,
            isSoundOn: true
        };
    } catch (error) {
        console.error('Error getting settings:', error);
        // Trả về giá trị mặc định nếu có lỗi
        return {
            numAvg: 5,
            numSubCount: 15,
            isSoundOn: true
        };
    }
};

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

        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        return false;
    }
};

export const resetDatabase = async () => {
    try {
        const database = await getDatabase();
        await database.executeSql('DROP TABLE IF EXISTS times;');
        await database.executeSql('DROP TABLE IF EXISTS settings;');
        await initDatabase();
        return true;
    } catch (error) {
        console.error('Error resetting database:', error);
        throw error;
    }
};
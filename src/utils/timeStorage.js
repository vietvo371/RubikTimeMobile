import { getDatabase, initDatabase } from './database';

export const TIME_KEY = 'RUBIK_TIMES';
const SETTINGS_KEY = 'RUBIK_SETTINGS';

export const saveTime = async (time) => {
    try {
        await initDatabase();
        const db = await getDatabase();
        const result = await db.executeSql(
            'INSERT INTO times (time, created_at) VALUES (?, ?)',
            [time, new Date().toISOString()]
        );
        return result[0].insertId;
    } catch (error) {
        console.error('Error saving time:', error);
        throw error;
    }
};

export const getTimes = async () => {
    try {
        await initDatabase();
        const db = await getDatabase();
        const [results] = await db.executeSql(
            'SELECT * FROM times ORDER BY created_at DESC'
        );
        
        const times = [];
        for (let i = 0; i < results.rows.length; i++) {
            const item = results.rows.item(i);
            times.push({
                id: item.id,
                time: item.time,
                createdAt: item.created_at
            });
        }
        return times;
    } catch (error) {
        console.error('Error getting times:', error);
        return [];
    }
};

export const deleteTime = async (id) => {
    try {
        await initDatabase();
        const db = await getDatabase();
        const [result] = await db.executeSql(
            'DELETE FROM times WHERE id = ?',
            [id]
        );
        return result.rowsAffected > 0;
    } catch (error) {
        console.error('Error deleting time:', error);
        throw error;
    }
};

export const saveSettings = async (settings) => {
    try {
        await initDatabase();
        const db = await getDatabase();
        
        // Sử dụng cấu trúc database mới
        await db.executeSql(
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
        throw error;
    }
};

export const getSettings = async () => {
    try {
        await initDatabase();
        const db = await getDatabase();
        const [results] = await db.executeSql(
            'SELECT numAvg, numSubCount, isSoundOn FROM settings ORDER BY id DESC LIMIT 1'
        );
        
        if (results.rows.length > 0) {
            const item = results.rows.item(0);
            return {
                numAvg: parseInt(item.numAvg),
                numSubCount: parseInt(item.numSubCount),
                isSoundOn: Boolean(item.isSoundOn)
            };
        }
        
        // Trả về giá trị mặc định nếu không có dữ liệu
        return {
            numAvg: 5,
            numSubCount: 15,
            isSoundOn: true
        };
    } catch (error) {
        console.error('Error getting settings:', error);
        return {
            numAvg: 5,
            numSubCount: 15,
            isSoundOn: true
        };
    }
};

export const clearAllTimes = async () => {
    try {
        await initDatabase();
        const db = await getDatabase();
        await db.executeSql('DELETE FROM times');
        return true;
    } catch (error) {
        console.error('Error clearing times:', error);
        throw error;
    }
};

const convertTimeToMs = (timeString) => {
    const [minutesAndSeconds, milliseconds] = timeString.split('.');
    const [minutes, seconds] = minutesAndSeconds.split(':');
    return parseInt(minutes) * 60000 + parseInt(seconds) * 1000 + parseInt(milliseconds);
};

const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor(ms % 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}; 
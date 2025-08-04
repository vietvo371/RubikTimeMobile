// Test script để kiểm tra performance với nhiều dữ liệu
// Chạy: node test-performance.js

const { getDatabase, initDatabase, saveTime, getTimes, getTimesCount, optimizeDatabase } = require('./src/utils/database');

async function generateTestData(count = 1000) {
    console.log(`Generating ${count} test records...`);
    
    const database = await getDatabase();
    await initDatabase();
    
    // Batch insert để tối ưu performance
    const batchSize = 100;
    const batches = Math.ceil(count / batchSize);
    
    for (let i = 0; i < batches; i++) {
        const batch = [];
        const start = i * batchSize;
        const end = Math.min(start + batchSize, count);
        
        for (let j = start; j < end; j++) {
            const minutes = Math.floor(Math.random() * 10) + 1;
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
        
        if ((i + 1) % 10 === 0) {
            console.log(`Inserted ${(i + 1) * batchSize} records...`);
        }
    }
    
    console.log(`Generated ${count} test records successfully!`);
}

async function testPerformance() {
    console.log('=== Performance Test ===');
    
    try {
        // Test với 1000 records
        await generateTestData(1000);
        
        // Test load times với pagination
        console.log('\nTesting pagination...');
        const startTime = Date.now();
        
        const times = await getTimes(50, 0); // Load 50 records đầu
        const totalCount = await getTimesCount();
        
        const loadTime = Date.now() - startTime;
        console.log(`Loaded ${times.length} records in ${loadTime}ms`);
        console.log(`Total records: ${totalCount}`);
        
        // Test optimize database
        console.log('\nTesting database optimization...');
        const optimizeStart = Date.now();
        await optimizeDatabase();
        const optimizeTime = Date.now() - optimizeStart;
        console.log(`Database optimization completed in ${optimizeTime}ms`);
        
        // Test load all times (không khuyến khích với large datasets)
        console.log('\nTesting full load (not recommended for large datasets)...');
        const fullLoadStart = Date.now();
        const allTimes = await getTimes(); // Load tất cả
        const fullLoadTime = Date.now() - fullLoadStart;
        console.log(`Loaded all ${allTimes.length} records in ${fullLoadTime}ms`);
        
        console.log('\n=== Performance Test Results ===');
        console.log(`Pagination load time: ${loadTime}ms`);
        console.log(`Full load time: ${fullLoadTime}ms`);
        console.log(`Optimization time: ${optimizeTime}ms`);
        console.log(`Performance improvement: ${Math.round((fullLoadTime - loadTime) / fullLoadTime * 100)}%`);
        
    } catch (error) {
        console.error('Error during performance test:', error);
    }
}

// Chạy test nếu file được execute trực tiếp
if (require.main === module) {
    testPerformance();
}

module.exports = {
    generateTestData,
    testPerformance
}; 
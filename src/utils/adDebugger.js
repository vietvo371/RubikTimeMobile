// Ad Debugger - Theo dõi và gỡ lỗi ads
class AdDebugger {
  constructor() {
    this.logs = [];
    this.errors = [];
    this.networkIssues = [];
    this.maxLogs = 100;
  }

  // Log thông tin ads
  log(message, type = 'info', data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      message,
      data
    };

    this.logs.push(logEntry);
    
    // Giới hạn số lượng logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console log với prefix
    const prefix = `[AdDebugger] ${type.toUpperCase()}`;
    if (data) {
      console.log(prefix, message, data);
    } else {
      console.log(prefix, message);
    }
  }

  // Log lỗi
  logError(error, context = '') {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      error: error.message || error,
      stack: error.stack,
      context
    };

    this.errors.push(errorEntry);
    this.log(`Error: ${error.message || error}`, 'error', { context, stack: error.stack });
  }

  // Log vấn đề network
  logNetworkIssue(issue, adType) {
    const networkIssue = {
      timestamp: new Date().toISOString(),
      issue,
      adType
    };

    this.networkIssues.push(networkIssue);
    this.log(`Network issue: ${issue}`, 'network', { adType });
  }

  // Lấy thống kê
  getStats() {
    return {
      totalLogs: this.logs.length,
      totalErrors: this.errors.length,
      totalNetworkIssues: this.networkIssues.length,
      recentErrors: this.errors.slice(-10),
      recentNetworkIssues: this.networkIssues.slice(-10)
    };
  }

  // Xóa logs cũ
  clearOldLogs() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    this.logs = this.logs.filter(log => new Date(log.timestamp) > oneHourAgo);
    this.errors = this.errors.filter(error => new Date(error.timestamp) > oneHourAgo);
    this.networkIssues = this.networkIssues.filter(issue => new Date(issue.timestamp) > oneHourAgo);
  }

  // Export logs để debug
  exportLogs() {
    return {
      logs: this.logs,
      errors: this.errors,
      networkIssues: this.networkIssues,
      stats: this.getStats()
    };
  }

  // Kiểm tra sức khỏe ads
  checkAdHealth() {
    const stats = this.getStats();
    const recentErrors = stats.recentErrors;
    const recentNetworkIssues = stats.recentNetworkIssues;

    let health = 'good';
    let issues = [];

    // Kiểm tra lỗi gần đây
    if (recentErrors.length > 5) {
      health = 'poor';
      issues.push(`Too many errors: ${recentErrors.length} in recent logs`);
    }

    // Kiểm tra vấn đề network
    if (recentNetworkIssues.length > 3) {
      health = 'poor';
      issues.push(`Network issues detected: ${recentNetworkIssues.length} recent issues`);
    }

    // Kiểm tra lỗi network-error cụ thể
    const networkErrors = recentErrors.filter(error => 
      error.error && error.error.includes('network-error')
    );
    
    if (networkErrors.length > 2) {
      health = 'poor';
      issues.push(`Multiple network errors: ${networkErrors.length} detected`);
    }

    return {
      health,
      issues,
      stats
    };
  }
}

// Export instance singleton
export const adDebugger = new AdDebugger();

// Auto-clear old logs every hour
setInterval(() => {
  adDebugger.clearOldLogs();
}, 60 * 60 * 1000);

export default AdDebugger;

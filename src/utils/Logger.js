class Logger {
    constructor() {
        this.logLevels = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            NONE: 4
        };

        // By default, logs are disabled in the production environment, and "DEBUG" is enabled in the development environment
        this.currentLevel = process.env.NODE_ENV === "production"
            ? this.logLevels.ERROR  // The production environment only keeps the "ERROR"
            : this.logLevels.DEBUG;

        // Caching method references to improve performance
        this.logMethods = new Map([
            [this.logLevels.DEBUG, console.debug],
            [this.logLevels.INFO, console.info],
            [this.logLevels.WARN, console.warn],
            [this.logLevels.ERROR, console.error]
        ]);
    }

    setLevel(level) {
        this.currentLevel = this.logLevels[level.toUpperCase()] || this.logLevels.ERROR;
    }

    shouldLog(level) {
        return level >= this.currentLevel;
    }

    formatMessage(level, message) {
        return `[${new Date().toISOString()}] [${level}] ${message}`;
    }

    debug(...args) {
        this._log(this.logLevels.DEBUG, "DEBUG", ...args);
    }

    info(...args) {
        this._log(this.logLevels.INFO, "INFO", ...args);
    }

    warn(...args) {
        this._log(this.logLevels.WARN, "WARN", ...args);
    }

    error(...args) {
        this._log(this.logLevels.ERROR, "ERROR", ...args);
    }

    _log(level, levelStr, ...args) {
        if (!this.shouldLog(level)) return;

        try {
            const logger = this.logMethods.get(level);
            if (logger) {
                logger(this.formatMessage(levelStr, ...args));
            }
        } catch (e) {
            // Prevent the logging itself from causing the program to crash
        }
    }
}

// Singleton mode export
export const logger = new Logger();
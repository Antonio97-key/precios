/**
 * Agente #19: Error Management & Prevention Officer
 * Centralized logging for the Price Monitoring project.
 */

interface ErrorContext {
    user_id?: string;
    endpoint?: string;
    component?: string;
    [key: string]: any;
}

class ErrorManager {
    private static instance: ErrorManager;
    private isProduction = process.env.NODE_ENV === 'production';

    private constructor() {}

    public static getInstance(): ErrorManager {
        if (!ErrorManager.instance) {
            ErrorManager.instance = new ErrorManager();
        }
        return ErrorManager.instance;
    }

    public captureError(error: Error | string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', context: ErrorContext = {}) {
        const errorData = {
            timestamp: new Date().toISOString(),
            message: typeof error === 'string' ? error : error.message,
            stack: typeof error === 'object' ? error.stack : null,
            severity,
            context,
            project: 'PriceNode'
        };

        // Always log to console in development
        if (!this.isProduction) {
            console.group(`[ERROR - ${severity}]`);
            console.error(errorData);
            console.groupEnd();
        }

        // In production, we would send this to Firestore (Agente 19 mandated)
        if (this.isProduction || severity === 'CRITICAL') {
            this.logToPersistence(errorData);
        }
    }

    private async logToPersistence(data: any) {
        // Implementation for Firestore logging
        try {
            // Lazy load db to avoid circular deps
            const { db } = await import('./firebase');
            const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
            
            await addDoc(collection(db, "logs_errores"), {
                ...data,
                created_at: serverTimestamp()
            });
        } catch (e) {
            console.error("Critical: ErrorManager failed to log to persistence", e);
        }
    }
}

export const errorManager = ErrorManager.getInstance();

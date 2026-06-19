import { log, Log } from "../modules/logger";
// Example Usage:
log(Log.Info, "AuthService", "User login successful", "User ID: 49201 connected from IP 192.168.1.1");
log(Log.Warning, "Database", "Connection pool reaching capacity", "Active connections: 85/100. Consider scaling.");
log(Log.Error, "PaymentGateway", "Transaction failed", "Stripe API returned status code 502 (Bad Gateway).");
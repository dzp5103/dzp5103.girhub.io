/**
 * Model Context Protocol (MCP) Types and Interfaces
 */
// MCP Error Codes
export var McpErrorCode;
(function (McpErrorCode) {
    McpErrorCode[McpErrorCode["ParseError"] = -32700] = "ParseError";
    McpErrorCode[McpErrorCode["InvalidRequest"] = -32600] = "InvalidRequest";
    McpErrorCode[McpErrorCode["MethodNotFound"] = -32601] = "MethodNotFound";
    McpErrorCode[McpErrorCode["InvalidParams"] = -32602] = "InvalidParams";
    McpErrorCode[McpErrorCode["InternalError"] = -32603] = "InternalError";
    McpErrorCode[McpErrorCode["ServerError"] = -32000] = "ServerError";
})(McpErrorCode || (McpErrorCode = {}));

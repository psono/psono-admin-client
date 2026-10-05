// Material Table 4 expects a default export with a v4 method. Modern UUID
// versions only expose named exports, so provide the legacy CommonJS shape.
module.exports = { v4: require('uuid').v4 };

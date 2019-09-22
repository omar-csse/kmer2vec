exports.err = (msg, status) => {
    let err = new Error(msg);
    err.status = status;
    return err
}
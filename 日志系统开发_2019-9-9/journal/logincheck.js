function checeklogin(req) {
	var sess = req.session;
	console.info(sess.userName);
	if (!sess.userName) {
		return false;
	} else {
		return true;
	}
}
exports.checeklogin = checeklogin;
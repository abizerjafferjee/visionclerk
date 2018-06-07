import mongoose from 'mongoose';

let resourceSchema = new mongoose.Schema({
	uid: {type: Number},
	_user_f_key: {type: Number},
	_pointer: {type: Object},
	owner: {type: String}
});

export default mongoose.model("Resource", resourceSchema);

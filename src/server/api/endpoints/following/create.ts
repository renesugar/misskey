import $ from 'cafy'; import ID from '../../../../cafy-id';
import User, { pack, ILocalUser } from '../../../../models/user';
import Following from '../../../../models/following';
import create from '../../../../services/following/create';

/**
 * Follow a user
 */
module.exports = (params: any, user: ILocalUser) => new Promise(async (res, rej) => {
	const follower = user;

	// Get 'userId' parameter
	const [userId, userIdErr] = $.type(ID).get(params.userId);
	if (userIdErr) return rej('invalid userId param');

	// 自分自身
	if (user._id.equals(userId)) {
		return rej('followee is yourself');
	}

	// Get followee
	const followee = await User.findOne({
		_id: userId
	}, {
		fields: {
			data: false,
			profile: false
		}
	});

	if (followee === null) {
		return rej('user not found');
	}

	// Check if already following
	const exist = await Following.findOne({
		followerId: follower._id,
		followeeId: followee._id
	});

	if (exist !== null) {
		return rej('already following');
	}

	// Create following
	create(follower, followee);

	// Send response
	res(await pack(followee._id, user));
});

// user.dto.res.js
const sendUserResponse = (res, userDTO) => {
    res.status(200).json(userDTO);
};

module.exports = {
    sendUserResponse,
};

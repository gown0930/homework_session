// validation.js

const idPattern = /^[a-zA-Z0-9_]{5,20}$/;
const pwPattern = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%^&*_-]{8,}$/;
const phonePattern = /^\d{10,11}$/;
const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
const nameLengthRegex = /^.{3,20}$/;

function validateId(id) {
   if (!id || id.trim() === "") throw { status: 400, message: '아이디를 입력해주세요.' };
   if (!idPattern.test(id)) throw { status: 400, message: '아이디 형식이 올바르지 않습니다.' };
}

function validatePassword(password) {
   if (!password || password.trim() === "") throw { status: 400, message: '비밀번호를 입력해주세요.' };
   if (!pwPattern.test(password)) throw { status: 400, message: '비밀번호 형식이 올바르지 않습니다.' };
}

function validatePhoneNumber(phoneNumber) {
   if (!phoneNumber || phoneNumber.trim() === "") throw { status: 400, message: '전화번호를 입력해주세요.' };
   if (!phonePattern.test(phoneNumber)) throw { status: 400, message: '전화번호 형식이 올바르지 않습니다.' };
}

function validateEmail(email) {
   if (!email || email.trim() === "") throw { status: 400, message: '이메일을 입력해주세요.' };
   if (!emailPattern.test(email)) throw { status: 400, message: '이메일 형식이 올바르지 않습니다.' };
}

function validateName(name) {
   if (!name || name.trim() === "") throw { status: 400, message: '이름을 입력해주세요.' };
   if (!nameLengthRegex.test(name)) throw { status: 400, message: '이름은 최소 3자 이상, 최대 20자까지 입력 가능합니다.' };
}

function validateContent(content) {
   if (!content || content.trim() === "") throw { status: 400, message: '입력 항목을 모두 입력해주세요' };
}

module.exports = {
   validateId,
   validatePassword,
   validatePhoneNumber,
   validateEmail,
   validateName,
   validateContent
};

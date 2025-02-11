export const validatePassword = (pw) => {
    return /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw) && 
    /[^A-Za-z0-9]/.test(pw) && pw.length > 4;
}
const isPord = process.env.NODE_ENV === "production";

const accessTokenCookieOptions = {
    httpOnly: true,
    secure: isPord,
    sameSite: isPord ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 1, 
};

const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: isPord,
    sameSite: isPord ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7,
};


export { accessTokenCookieOptions, refreshTokenCookieOptions };
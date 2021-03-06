import parseJwt from './parseJwt';

const REFRESH_TOKEN = 'refreshToken';
const IDENTITY_ID = 'identityID';

const initialMemoryTokens = {
  idToken: null,
  accessToken: null,
  exp: -1,
};

let inMemoryTokens = initialMemoryTokens;

export function setTokens(idToken, accessToken) {
  inMemoryTokens = {
    idToken: idToken,
    accessToken: accessToken,
    exp: Math.min(parseJwt(idToken).exp, parseJwt(accessToken).exp),
  };;
}

export function getTokens() {
  const curTime = Math.ceil(Date.now()/1000) + 3*60; // current time in seconds + 3 minutes

  // invalid tokens
  if (curTime >= inMemoryTokens.exp) {
    inMemoryTokens = initialMemoryTokens;
  }

  return inMemoryTokens;
}

export function setRefreshToken(token) {
  localStorage.setItem(REFRESH_TOKEN, token);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN);
}

// use for better security with IAM but who cares
// export function setIdentityID(identityID) {
//   localStorage.setItem(IDENTITY_ID, identityID);
// }

// export function getIdentityID() {
//   return localStorage.getItem(IDENTITY_ID);
// }

export function clearTokens() {
  localStorage.removeItem(REFRESH_TOKEN);
  localStorage.removeItem(IDENTITY_ID);
  inMemoryTokens = initialMemoryTokens;
}
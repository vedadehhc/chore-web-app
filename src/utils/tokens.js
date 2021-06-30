import parseJwt from './parseJwt';

const REFRESH_TOKEN = 'refreshToken';

let inMemoryTokens = {
  idToken: null,
  accessToken: null,
  exp: -1,
};

export function setTokens(idToken, accessToken) {
  inMemoryTokens = {
    idToken: idToken,
    accessToken: accessToken,
    exp: Math.min(parseJwt(idToken).exp, parseJwt(accessToken).exp),
  };;
}

export function getTokens() {
  const curTime = Math.ceil(Date.now()/1000) + 60; // current time in seconds + 1 minute

  // invalid tokens
  if (curTime >= inMemoryTokens.exp) {
    inMemoryTokens.idToken = null;
    inMemoryTokens.accessToken = null;
  }

  return inMemoryTokens;
}

export function setRefreshToken(token) {
  localStorage.setItem(REFRESH_TOKEN, token);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN);
}

export function clearTokens() {
  localStorage.removeItem(REFRESH_TOKEN);
  inMemoryTokens = null;
}
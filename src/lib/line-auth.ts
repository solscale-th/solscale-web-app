export const LINE_OAUTH_STATE_KEY = "solscale_line_oauth_state";
export const LINE_OAUTH_ROLE_KEY = "solscale_line_oauth_role";
export const LINE_OAUTH_RETURN_TO_KEY = "solscale_line_oauth_return_to";

export function buildLineAuthorizeUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
}): string {
  const query = new URLSearchParams({
    response_type: "code",
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    state: params.state,
    scope: "openid profile email",
  });
  return `https://access.line.me/oauth2/v2.1/authorize?${query.toString()}`;
}

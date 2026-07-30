import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createGoogleOAuthApi, type GoogleOAuthStatus } from "@emme/contracts";
import { api } from "@/api/restClient";

const oauthApi = createGoogleOAuthApi(api);

export function useGoogleOAuth() {
  const queryClient = useQueryClient();

  const status = useQuery<GoogleOAuthStatus>({
    queryKey: ["google-oauth-status"],
    queryFn: () => oauthApi.status(),
  });

  const disconnect = useMutation({
    mutationFn: () => oauthApi.disconnect(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["google-oauth-status"] }),
  });

  const connect = (personaType: "STAFF" | "CLIENT" = "STAFF") => {
    window.location.href = `/api/v1/google/oauth/authorize?personaType=${personaType}`;
  };

  return { status, connect, disconnect };
}

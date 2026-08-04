import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createGoogleOAuthApi, type GoogleOAuthStatus } from '@emme/contracts';
import { api } from '@/api/restClient';
import { apiErrorMessage } from '@/api/apiErrorMessage';
import { useAppTranslation } from '@/app/translation';
import { toast } from 'sonner';

const oauthApi = createGoogleOAuthApi(api);

export function useGoogleOAuth() {
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();

  const status = useQuery<GoogleOAuthStatus>({
    queryKey: ['google-oauth-status'],
    queryFn: () => oauthApi.status(),
  });

  const disconnect = useMutation({
    mutationFn: () => oauthApi.disconnect(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['google-oauth-status'] }),
    onError: (error) => toast.error(apiErrorMessage(error, t, 'common.errors.google_oauth_failed')),
  });

  const connect = (personaType: 'STAFF' | 'CLIENT' = 'STAFF') => {
    window.location.href = `/api/google/oauth/authorize?personaType=${personaType}`;
  };

  return { status, connect, disconnect };
}

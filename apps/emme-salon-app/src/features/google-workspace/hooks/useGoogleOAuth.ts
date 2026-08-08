import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@emme/core';
import type { GoogleOAuthStatus } from '@emme/api';
import { apiErrorMessage } from '@/api/apiErrorMessage';
import { useAppTranslation } from '@/app/translation';
import { toast } from 'sonner';

export function useGoogleOAuth() {
  const api = useApi();
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();

  const status = useQuery<GoogleOAuthStatus>({
    queryKey: ['google-oauth-status'],
    queryFn: () => api.googleOAuth.status(),
  });

  const disconnect = useMutation({
    mutationFn: () => api.googleOAuth.disconnect(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['google-oauth-status'] }),
    onError: (error) => toast.error(apiErrorMessage(error, t, 'common.errors.google_oauth_failed')),
  });

  const connect = (personaType: 'STAFF' | 'CLIENT' = 'STAFF') => {
    window.location.href = `/api/google/oauth/authorize?personaType=${personaType}`;
  };

  return { status, connect, disconnect };
}

import { createBrowserClient } from 'https://esm.sh/@supabase/ssr@0.5.2';

const SUPABASE_URL = 'https://kketxmprsmqjbikfgbdf.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_5WlJ1UtU7DOuLwkI2J7Kkg_zRUbgWfU';

let client;
export function getSupabaseClient() {
  if (!client) {
    client = createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  }
  return client;
}

export async function getUser() {
  const { data, error } = await getSupabaseClient().auth.getUser();
  if (error) return null;
  return data.user;
}

export async function signInWithGitHub(next) {
  const redirectTo = new URL('/auth/callback', window.location.origin);
  if (next) redirectTo.searchParams.set('next', next);
  await getSupabaseClient().auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: redirectTo.toString() },
  });
}

export async function signInWithEmail(email, password) {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email, password, { firstName, lastName } = {}) {
  const redirectTo = new URL('/auth/callback', window.location.origin);
  const { data, error } = await getSupabaseClient().auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo.toString(),
      data: {
        first_name: firstName || null,
        last_name: lastName || null,
        full_name: [firstName, lastName].filter(Boolean).join(' ') || null,
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await getSupabaseClient().auth.signOut();
}

export async function loadProgress() {
  const user = await getUser();
  if (!user) return null;
  const { data } = await getSupabaseClient()
    .from('workspace_progress')
    .select('current_step, answers')
    .eq('user_id', user.id)
    .maybeSingle();
  return data;
}

export async function saveProgress(currentStep, answers) {
  const user = await getUser();
  if (!user) return;
  await getSupabaseClient().from('workspace_progress').upsert({
    user_id: user.id,
    current_step: currentStep,
    answers,
    updated_at: new Date().toISOString(),
  });
}

export async function loadMentorConfig() {
  const user = await getUser();
  if (!user) return null;
  const { data } = await getSupabaseClient()
    .from('mentor_config')
    .select('engine, provider, byok_endpoint, runtime, local_model')
    .eq('user_id', user.id)
    .maybeSingle();
  return data;
}

export async function saveMentorConfig(config) {
  const user = await getUser();
  if (!user) return;
  await getSupabaseClient().from('mentor_config').upsert({
    user_id: user.id,
    engine: config.engine ?? null,
    provider: config.provider ?? null,
    byok_endpoint: config.byokEndpoint ?? null,
    runtime: config.runtime ?? null,
    local_model: config.localModel ?? null,
    updated_at: new Date().toISOString(),
  });
}

export async function recordScenarioAttempt({ scenarioId, status, score, submittedAt }) {
  const user = await getUser();
  if (!user) return;
  await getSupabaseClient().from('scenario_attempts').insert({
    user_id: user.id,
    scenario_id: scenarioId,
    status: status ?? 'in_progress',
    score: score ?? null,
    submitted_at: submittedAt ?? null,
  });
}

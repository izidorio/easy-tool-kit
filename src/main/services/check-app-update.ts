import axios from 'axios';
import { app } from 'electron';
import { compareSemver } from './compare-semver';
import { logAppUpdate } from './app-update-log';
import type { AppUpdateCheckResult } from '../../types/app-update';

const GITHUB_OWNER = 'izidorio';
const GITHUB_REPO = 'easy-tool-kit';
const GITHUB_API_LATEST_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
const GITHUB_LATEST_RELEASE_PAGE = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
const UPDATE_ASSET_NAME = 'easy-tool-kit.zip';

type GitHubReleaseAsset = {
  name: string;
  browser_download_url: string;
};

type GitHubRelease = {
  tag_name: string;
  name: string;
  body: string | null;
  assets: GitHubReleaseAsset[];
};

function normalizeTag(tag: string): string {
  return tag.replace(/^v/i, '');
}

function getUserAgent(): string {
  return `easy-tool-kit/${app.getVersion()} (${GITHUB_OWNER}/${GITHUB_REPO})`;
}

function getFinalResponseUrl(response: { request?: { res?: { responseUrl?: string } }; config: { url?: string } }): string {
  return response.request?.res?.responseUrl ?? response.config.url ?? '';
}

function parseTagFromReleaseUrl(url: string): string | null {
  const match = url.match(/\/releases\/tag\/(v[^/?#]+)/i);
  return match?.[1] ?? null;
}

function buildDownloadUrl(tag: string): string {
  const tagWithV = tag.startsWith('v') || tag.startsWith('V') ? tag : `v${tag}`;
  return `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/download/${tagWithV}/${UPDATE_ASSET_NAME}`;
}

async function fetchLatestViaRedirect(): Promise<{ tag: string; latestVersion: string; downloadUrl: string }> {
  logAppUpdate(`Consultando release latest via redirect: ${GITHUB_LATEST_RELEASE_PAGE}`);

  const response = await axios.get(GITHUB_LATEST_RELEASE_PAGE, {
    maxRedirects: 10,
    timeout: 30_000,
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'User-Agent': getUserAgent(),
    },
    validateStatus: (status) => status >= 200 && status < 400,
  });

  const finalUrl = getFinalResponseUrl(response);
  logAppUpdate(`URL final após redirect: ${finalUrl}`);

  const tag = parseTagFromReleaseUrl(finalUrl);
  if (!tag) {
    throw new Error(`Não foi possível ler a tag do release em: ${finalUrl}`);
  }

  const latestVersion = normalizeTag(tag);
  const downloadUrl = buildDownloadUrl(tag);
  logAppUpdate(`Tag via redirect: ${tag} → downloadUrl=${downloadUrl}`);

  return { tag, latestVersion, downloadUrl };
}

async function fetchLatestViaApi(): Promise<{
  latestVersion: string;
  releaseName: string;
  releaseNotes: string;
  downloadUrl: string;
}> {
  logAppUpdate(`Consultando API GitHub: ${GITHUB_API_LATEST_URL}`);

  const { data } = await axios.get<GitHubRelease>(GITHUB_API_LATEST_URL, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': getUserAgent(),
      'X-GitHub-Api-Version': '2022-11-28',
    },
    timeout: 30_000,
  });

  const latestVersion = normalizeTag(data.tag_name);
  const assetNames = data.assets.map((item) => item.name).join(', ') || '(nenhum)';
  logAppUpdate(`Release API tag=${data.tag_name} nome="${data.name}" latestVersion=${latestVersion}`);
  logAppUpdate(`Assets no release: ${assetNames}`);

  const asset = data.assets.find((item) => item.name === UPDATE_ASSET_NAME);
  if (!asset) {
    throw new Error(`Release sem o arquivo ${UPDATE_ASSET_NAME}.`);
  }

  return {
    latestVersion,
    releaseName: data.name || `v${latestVersion}`,
    releaseNotes: (data.body ?? '').trim(),
    downloadUrl: asset.browser_download_url,
  };
}

function buildResult(
  currentVersion: string,
  latestVersion: string,
  downloadUrl: string,
  releaseName: string,
  releaseNotes: string
): AppUpdateCheckResult {
  const compareResult = compareSemver(latestVersion, currentVersion);
  const updateAvailable = compareResult > 0;
  logAppUpdate(
    `compareSemver(latest=${latestVersion}, current=${currentVersion}) = ${compareResult} → updateAvailable=${updateAvailable}`
  );

  return {
    updateAvailable,
    currentVersion,
    latestVersion,
    releaseName,
    releaseNotes,
    downloadUrl,
  };
}

export async function checkAppUpdate(): Promise<AppUpdateCheckResult> {
  const currentVersion = app.getVersion();
  logAppUpdate(`Iniciando verificação. Versão local (app.getVersion): ${currentVersion}`);

  try {
    const redirect = await fetchLatestViaRedirect();
    return buildResult(
      currentVersion,
      redirect.latestVersion,
      redirect.downloadUrl,
      `v${redirect.latestVersion}`,
      ''
    );
  } catch (redirectError) {
    const redirectMessage = redirectError instanceof Error ? redirectError.message : String(redirectError);
    logAppUpdate(`Falha no método redirect: ${redirectMessage}`);
  }

  try {
    const api = await fetchLatestViaApi();
    return buildResult(
      currentVersion,
      api.latestVersion,
      api.downloadUrl,
      api.releaseName,
      api.releaseNotes
    );
  } catch (apiError) {
    if (axios.isAxiosError(apiError)) {
      const status = apiError.response?.status;
      const rateLimit = apiError.response?.headers['x-ratelimit-remaining'];
      logAppUpdate(`API GitHub falhou. status=${status ?? 'n/a'} rateLimitRemaining=${rateLimit ?? 'n/a'}`);
      if (status === 403) {
        throw new Error(
          'GitHub bloqueou a consulta (403). Tente novamente em alguns minutos ou verifique sua conexão.'
        );
      }
    }
    throw apiError;
  }
}

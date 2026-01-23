'use client'
const buildUrl = (path, params) => `https://phantom.app/ul/v1/${path}?${params.toString()}`;

export { buildUrl };

import { t, getLanguage, setLanguage, TRANSLATIONS } from './i18n.js';

// SVG Icons
const ICONS = {
  truck: `<svg class="nav-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8h4.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>`,
  home: `<svg class="nav-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
  add: `<svg class="nav-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  list: `<svg class="nav-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>`,
  user: `<svg class="nav-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
  swap: `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>`,
  search: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>`,
  arrowRight: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>`,
  info: `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  shieldAlert: `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
  edit: `<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>`,
  logout: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>`,
  close: `<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
  steering: `<svg class="nav-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v4m-3.5 2L12 11l3.5 2m-3.5 0a2 2 0 100-4 2 2 0 000 4z"/></svg>`,
  addTruck: `<svg class="nav-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8h4.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v4m-2-2h4"/></svg>`,
  phone: `<svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>`,
  trash: `<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`,
  chat: `<svg class="nav-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>`,
  send: `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>`,
  shieldCheck: `<svg class="nav-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`,
  creditCard: `<svg class="nav-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>`,
  headset: `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 11a9 9 0 0118 0v3a3 3 0 01-3 3h-1m-14-6H2a3 3 0 003 3h1"/></svg>`,
  mail: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`,
  clock: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  mapPin: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
  globe: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>`,
  telegram: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
  box: `<svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`,
  chevronRight: `<svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>`,
  key: `<svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>`,
  menu: `<svg class="nav-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>`,
  download: `<svg class="nav-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>`,
  aiSparkle: `<svg class="svg-icon-ai" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c0 4.5-3.5 8-8 8 4.5 0 8 3.5 8 8 0-4.5 3.5-8 8-8-4.5 0-8-3.5-8-8z"/><path d="M19 3c0 1.5-1 2.5-2.5 2.5 1.5 0 2.5 1 2.5 2.5 0-1.5 1-2.5 2.5-2.5-1.5 0-2.5-1-2.5-2.5z"/></svg>`,
  aiBot: `<svg class="svg-icon-bot" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="4"/><circle cx="8.5" cy="16" r="1.5" fill="currentColor"/><circle cx="15.5" cy="16" r="1.5" fill="currentColor"/><path d="M12 2v4M8 2h8M2 15h1M21 15h1"/></svg>`,
  translate: `<svg class="svg-icon-translate" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h7M7 2v3M4 11c1.5 2 3.5 3.5 6 4M9 5c0 3.5-2 6.5-5 8"/><path d="M14 19l4-10 4 10M15.5 15.5h5"/></svg>`,
  radar: `<svg class="svg-icon-radar" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1010 10A10 10 0 0012 2z"/><path d="M12 6a6 6 0 106 6"/><path d="M12 10a2 2 0 102 2"/><path d="M12 12l5-5"/></svg>`,
  doc: `<svg class="svg-icon-doc" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
  bulb: `<svg class="svg-icon-bulb" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6m-4 3h2M12 2a7 7 0 00-7 7c0 2.5 1.5 4.5 3 6h8c1.5-1.5 3-3.5 3-6a7 7 0 00-7-7z"/></svg>`,
  target: `<svg class="svg-icon-target" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  minimize: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  arrowRightMini: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-6-6l6 6-6 6"/></svg>`,
  bolt: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
  warning: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  searchLarge: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`
};

// Global Application State
const state = {
  pwaCanInstall: false,
  showPwaBanner: false,
  aiCargoText: '',
  aiCargoLoading: false,
  aiTruckText: '',
  aiTruckLoading: false,
  aiDispatcherOpen: false,
  aiDispatcherMessages: [],
  aiDispatcherLoading: false,
  translatedMessages: {},
  user: null,
  metadata: {
    locations: [],
    body_types: [],
    business_roles: []
  },
  currentRoute: 'home',
  routeParams: {},
  homeTab: 'cargo', // 'cargo' | 'trucks'
  myListingsTab: 'cargo', // 'cargo' | 'trucks'
  searchFilters: {
    origin_country: '',
    origin_locality: '',
    origin_custom: '',
    destination_country: '',
    destination_locality: '',
    destination_custom: '',
    body_type: '',
    sort: 'newest'
  },
  truckSearchFilters: {
    origin_country: '',
    origin_city: '',
    origin_custom: '',
    destination_country: '',
    destination_city: '',
    destination_custom: '',
    body_type: '',
    sort: 'newest'
  },
  publicListings: [],
  publicTransports: [],
  myListings: [],
  myTransports: [],
  revealedPhones: {}, // { [transportId]: true }
  currentListing: null,
  loading: false,
  publishFormSubmitting: false,
  publishTruckFormSubmitting: false,
  profileFormSubmitting: false,
  publishDraft: {
    origin_country: 'UZ',
    origin_locality: 'tashkent_city',
    origin_custom: '',
    destination_country: 'KZ',
    destination_locality: 'almaty',
    destination_custom: '',
    cargo_name: '',
    cargo_description: '',
    weight: '',
    volume: '',
    dim_length: '',
    dim_width: '',
    dim_height: '',
    body_type: 'curtainsider',
    loading_date_type: 'ready_now',
    loading_date: '',
    price_type: 'negotiable',
    price_amount: '',
    price_currency: 'USD'
  },
  publishTruckDraft: {
    origin_country: 'UZ',
    origin_city: 'tashkent_city',
    origin_custom: '',
    destination_country: '',
    destination_city: '',
    destination_custom: '',
    body_type: 'curtainsider',
    truck_model: '',
    max_weight: '',
    volume: '',
    available_date: '',
    price_expectation: '',
    phone: '',
    notes: ''
  },
  modal: null, // { type: 'complete_profile' | 'edit_listing' | 'auth', data: any }
  unreadCount: 0,
  conversations: [],
  activeConversationId: null,
  activeConversationData: null,
  chatFilter: '',
  chatOfferInputVisible: false,
  chatOfferAmount: '',
  chatMessageDraft: '',
  chatSending: false,
  chatPollInterval: null,
  unreadPollInterval: null,
  adminTab: 'overview', // 'overview' | 'users' | 'moderation'
  adminStats: null,
  adminUsers: [],
  adminUsersLoading: false,
  adminUsersSearch: '',
  adminRoleFilter: 'all',
  adminModerationTab: 'cargo', // 'cargo' | 'transports'
  adminListings: { cargo: [], transports: [] },
  adminListingsLoading: false,
  subStatus: null,
  plans: [],
  plansLoading: false,
  adminSubTab: 'requests', // 'requests' | 'plans' | 'payment'
  adminPlans: [],
  adminSubRequests: [],
  paymentSettings: {
    card_number: '9860 0301 4455 8899',
    card_holder: 'Humo Logistics MCHJ',
    card_bank: 'Humo / Uzcard',
    instructions_uz: 'Click, Payme yoki bank ilovasi orqali to‘lov qiling va quyida chek raqami yoki to‘lovchi ismini qoldiring.',
    instructions_ru: 'Оплатите через Click, Payme или банковское приложение и укажите номер чека или имя плательщика ниже.',
    instructions_en: 'Pay via Click, Payme or banking app and enter your payment receipt number or sender name below.'
  },
  supportSettings: null,
  socialLinks: [],
  supportWidgetOpen: false,
  adminSupportTab: 'contacts', // 'contacts' | 'socials'
  adminSocials: []
};

function getSocialIcon(platform, size = 18) {
  const p = (platform || '').toLowerCase();
  if (ICONS[p]) return ICONS[p];
  if (p === 'twitter' || p === 'x') {
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
  }
  return ICONS.globe;
}

function getSocialColor(platform) {
  const p = (platform || '').toLowerCase();
  switch (p) {
    case 'telegram': return '#229ED9';
    case 'instagram': return '#E1306C';
    case 'facebook': return '#1877F2';
    case 'youtube': return '#FF0000';
    case 'whatsapp': return '#25D366';
    case 'linkedin': return '#0A66C2';
    case 'tiktok': return '#00F2FE';
    case 'twitter': case 'x': return '#ffffff';
    default: return 'var(--accent-primary)';
  }
}

// Toast notification helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-root');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Formatters
function formatPrice(listing) {
  if (listing.price_type === 'negotiable' || !listing.price_amount) {
    return t('negotiable_price');
  }
  return `${Number(listing.price_amount).toLocaleString()} ${listing.price_currency || 'UZS'}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(getLanguage() === 'uz' ? 'uz-UZ' : getLanguage() === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function getLocalizedName(obj) {
  if (!obj) return '';
  const lang = getLanguage();
  return obj.name ? (obj.name[lang] || obj.name.uz || obj.name.en || '') : '';
}

function getCountryLabel(code) {
  if (!code || code === 'ANY') return t('filter_any_destination');
  const c = state.metadata.locations.find(item => item.code === code);
  return c ? getLocalizedName(c) : code;
}

function getLocalityLabel(countryCode, localityId, isCustom = false) {
  if (!localityId) return '';
  if (isCustom) return localityId;
  const c = state.metadata.locations.find(item => item.code === countryCode);
  if (!c) return localityId;
  const l = c.localities.find(item => item.id === localityId);
  return l ? getLocalizedName(l) : localityId;
}

function getBodyTypeLabel(id) {
  const b = state.metadata.body_types.find(item => item.id === id);
  return b ? getLocalizedName(b) : id;
}

function getRoleLabel(id) {
  const r = state.metadata.business_roles.find(item => item.id === id);
  return r ? getLocalizedName(r) : (id || '');
}

// API Helpers
async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const res = await fetch(path, {
    credentials: 'same-origin',
    ...options,
    headers
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.message || data.error || 'API Request failed');
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Lightweight Ripple Wave Effect for Buttons and Cards
function initRippleFeedback() {
  document.addEventListener('pointerdown', (e) => {
    const target = e.target.closest('.btn, .swap-btn, .cargo-card, .pricing-card, .footer-quick-link, .btn-admin-action, .admin-filter-pill, .chat-listing-btn');
    if (!target || target.disabled || target.classList.contains('disabled')) return;

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple-wave';
    const size = Math.max(rect.width, rect.height) * 1.8;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    target.appendChild(ripple);
    setTimeout(() => {
      if (ripple.parentElement) ripple.remove();
    }, 600);
  });
}

// Initialize Application
async function initApp() {
  try {
    initRippleFeedback();

    // 1. Fetch metadata (locations, body types, roles)
    const meta = await api('/api/metadata');
    state.metadata = meta;

    // Fetch active payment settings (card number, instructions)
    loadPaymentSettings();

    // Fetch support settings and social links
    loadSupportData();

    // 2. Fetch current authenticated user
    const authData = await api('/api/auth/me');
    state.user = authData.user;
    if (state.user && state.user.phone) {
      state.publishTruckDraft.phone = state.user.phone;
    }

    if (state.user) {
      pollUnreadCount();
      loadSubStatus();
      if (!state.unreadPollInterval) {
        state.unreadPollInterval = setInterval(pollUnreadCount, 15000);
      }
    }
  } catch (err) {
    console.error('Initialization error:', err);
  }

  // 3. Listen for route hash changes
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

// Router
function navigate(hash) {
  window.location.hash = hash;
}

function handleRoute() {
  const rawHash = window.location.hash.slice(1) || '/';
  // Strip query string from route matching
  const qIdx = rawHash.indexOf('?');
  const pathOnly = qIdx !== -1 ? rawHash.slice(0, qIdx) : rawHash;
  const parts = pathOnly.split('/').filter(Boolean);

  // Clear active chat message poll interval when switching views
  if (state.chatPollInterval) {
    clearInterval(state.chatPollInterval);
    state.chatPollInterval = null;
  }

  if (parts.length === 0 || parts[0] === '') {
    state.currentRoute = 'home';
    state.routeParams = {};
    if (state.homeTab === 'trucks') {
      loadPublicTransports();
    } else {
      loadPublicListings();
    }
  } else if (parts[0] === 'cargo') {
    if (parts[1]) {
      state.currentRoute = 'detail';
      state.routeParams = { id: parts[1] };
      loadListingDetail(parts[1]);
    } else {
      state.currentRoute = 'cargo';
      state.routeParams = {};
      loadPublicListings();
    }
  } else if (parts[0] === 'trucks') {
    state.currentRoute = 'trucks';
    state.routeParams = {};
    loadPublicTransports();
  } else if (parts[0] === 'messages') {
    state.currentRoute = 'messages';
    state.routeParams = {};
    if (!state.user) {
      navigate('/auth');
      return;
    }
    // Parse conversation ID if present in query string
    if (qIdx !== -1) {
      const searchParams = new URLSearchParams(rawHash.slice(qIdx + 1));
      const convId = searchParams.get('id');
      if (convId) {
        state.activeConversationId = convId;
      }
    }
    loadConversationsAndActive();
    // Poll every 3 seconds for new incoming messages in active conversation
    state.chatPollInterval = setInterval(() => {
      if (state.currentRoute === 'messages' && state.activeConversationId) {
        silentRefreshActiveChat();
      }
    }, 3000);
  } else if (parts[0] === 'publish') {
    state.currentRoute = 'publish';
    state.routeParams = {};
    if (!state.user) {
      navigate('/auth');
      return;
    }
  } else if (parts[0] === 'publish-truck') {
    state.currentRoute = 'publish-truck';
    state.routeParams = {};
    if (!state.user) {
      navigate('/auth');
      return;
    }
    if (state.user && state.user.phone && !state.publishTruckDraft.phone) {
      state.publishTruckDraft.phone = state.user.phone;
    }
  } else if (parts[0] === 'my-listings') {
    state.currentRoute = 'my-listings';
    state.routeParams = {};
    if (!state.user) {
      navigate('/auth');
      return;
    }
    loadMyListings();
    loadMyTransports();
  } else if (parts[0] === 'profile') {
    state.currentRoute = 'profile';
    state.routeParams = {};
    if (!state.user) {
      navigate('/auth');
      return;
    }
  } else if (parts[0] === 'admin') {
    state.currentRoute = 'admin';
    state.routeParams = {};
    if (!state.user) {
      navigate('/auth');
      return;
    }
    if (state.user.role !== 'admin') {
      showToast(t('admin_only_access'), 'error');
      navigate('/');
      return;
    }
    loadAdminData();
  } else if (parts[0] === 'pricing') {
    state.currentRoute = 'pricing';
    state.routeParams = {};
    loadPricingData();
  } else if (parts[0] === 'auth') {
    state.currentRoute = 'auth';
    state.routeParams = {};
  } else {
    state.currentRoute = 'home';
    state.routeParams = {};
    loadPublicListings();
  }

  render();
}

// Data Loaders
async function loadPublicListings() {
  state.loading = true;
  render();

  try {
    const params = new URLSearchParams();
    if (state.searchFilters.origin_country) {
      params.append('origin_country', state.searchFilters.origin_country);
    }
    if (state.searchFilters.origin_locality) {
      const isCustom = state.searchFilters.origin_locality === '__custom__';
      params.append('origin_locality', isCustom ? state.searchFilters.origin_custom : state.searchFilters.origin_locality);
    }
    if (state.searchFilters.destination_country) {
      params.append('destination_country', state.searchFilters.destination_country);
    }
    if (state.searchFilters.destination_locality) {
      const isCustom = state.searchFilters.destination_locality === '__custom__';
      params.append('destination_locality', isCustom ? state.searchFilters.destination_custom : state.searchFilters.destination_locality);
    }
    if (state.searchFilters.body_type) {
      params.append('body_type', state.searchFilters.body_type);
    }
    if (state.searchFilters.sort) {
      params.append('sort', state.searchFilters.sort);
    }

    const res = await api(`/api/listings?${params.toString()}`);
    state.publicListings = res.listings;
  } catch (err) {
    showToast(t('err_general'), 'error');
  } finally {
    state.loading = false;
    render();
  }
}

async function loadPublicTransports() {
  state.loading = true;
  render();

  try {
    const params = new URLSearchParams();
    if (state.truckSearchFilters.origin_country) {
      params.append('origin_country', state.truckSearchFilters.origin_country);
    }
    if (state.truckSearchFilters.origin_city) {
      const isCustom = state.truckSearchFilters.origin_city === '__custom__';
      params.append('origin_city', isCustom ? state.truckSearchFilters.origin_custom : state.truckSearchFilters.origin_city);
    }
    if (state.truckSearchFilters.destination_country) {
      params.append('destination_country', state.truckSearchFilters.destination_country);
    }
    if (state.truckSearchFilters.destination_city) {
      const isCustom = state.truckSearchFilters.destination_city === '__custom__';
      params.append('destination_city', isCustom ? state.truckSearchFilters.destination_custom : state.truckSearchFilters.destination_city);
    }
    if (state.truckSearchFilters.body_type) {
      params.append('body_type', state.truckSearchFilters.body_type);
    }
    if (state.truckSearchFilters.sort) {
      params.append('sort', state.truckSearchFilters.sort);
    }

    const res = await api(`/api/transports?${params.toString()}`);
    state.publicTransports = res.transports;
  } catch (err) {
    showToast(t('err_general'), 'error');
  } finally {
    state.loading = false;
    render();
  }
}

async function loadMyListings() {
  if (!state.user) return;
  state.loading = true;
  render();

  try {
    const res = await api('/api/listings/my');
    state.myListings = res.listings;
  } catch (err) {
    showToast(t('err_general'), 'error');
  } finally {
    state.loading = false;
    render();
  }
}

async function loadMyTransports() {
  if (!state.user) return;
  try {
    const res = await api('/api/transports/my');
    state.myTransports = res.transports;
  } catch (err) {
    showToast(t('err_general'), 'error');
  } finally {
    render();
  }
}

async function loadListingDetail(id) {
  state.loading = true;
  render();

  try {
    const res = await api(`/api/listings/${id}`);
    state.currentListing = res.listing;
  } catch (err) {
    showToast(t('err_general'), 'error');
    navigate('/cargo');
  } finally {
    state.loading = false;
    render();
  }
}

// Chat API Operations
async function pollUnreadCount() {
  if (!state.user) {
    state.unreadCount = 0;
    updateNavBadges();
    return;
  }
  try {
    const res = await api('/api/chat/unread-count');
    if (res && typeof res.unread_count === 'number') {
      const changed = state.unreadCount !== res.unread_count;
      state.unreadCount = res.unread_count;
      if (changed) {
        updateNavBadges();
      }
    }
  } catch (err) {
    // Ignore network blip
  }
}

function updateNavBadges() {
  const badgeEls = document.querySelectorAll('.chat-unread-badge');
  badgeEls.forEach(el => {
    if (state.unreadCount > 0) {
      el.textContent = state.unreadCount;
      el.style.display = 'inline-block';
    } else {
      el.style.display = 'none';
    }
  });
}

// Admin Panel Data Loaders & Action Handlers
async function loadAdminData() {
  if (!state.user || state.user.role !== 'admin') return;
  state.loading = true;
  render();

  try {
    await loadAdminStats();
    if (state.adminTab === 'users') {
      await loadAdminUsers();
    } else if (state.adminTab === 'moderation') {
      await loadAdminListings();
    } else if (state.adminTab === 'subscriptions') {
      await loadAdminSubData();
    } else if (state.adminTab === 'support') {
      await loadAdminSupportData();
    }
  } catch (err) {
    showToast(err.message || t('err_general'), 'error');
  } finally {
    state.loading = false;
    render();
  }
}

async function loadSupportData() {
  try {
    const res = await api('/api/support');
    if (res) {
      state.supportSettings = res.support || null;
      state.socialLinks = res.socials || [];
      render();
    }
  } catch (err) {
    console.error('Failed to load support data:', err);
  }
}

async function loadAdminSupportData() {
  try {
    const res = await api('/api/admin/support');
    if (res) {
      state.supportSettings = res.settings || null;
      state.adminSocials = res.socials || [];
      state.socialLinks = (res.socials || []).filter(s => s.is_active);
      render();
    }
  } catch (err) {
    console.error('Failed to load admin support data:', err);
  }
}

async function loadAdminSubData() {
  try {
    const [plansRes, reqsRes, payRes] = await Promise.all([
      api('/api/admin/plans'),
      api('/api/admin/subscription-requests'),
      api('/api/admin/payment-settings')
    ]);
    state.adminPlans = plansRes.plans || [];
    state.adminSubRequests = reqsRes.requests || [];
    if (payRes && payRes.settings) {
      state.paymentSettings = payRes.settings;
    }
  } catch (err) {
    console.error('Failed to load admin subscription data:', err);
  }
}

async function loadPaymentSettings() {
  try {
    const res = await api('/api/subscriptions/payment-settings');
    if (res && res.settings) {
      state.paymentSettings = res.settings;
    }
  } catch (err) {
    console.error('Failed to load payment settings:', err);
  }
}

function formatUzs(val) {
  if (val === undefined || val === null) return '0';
  return Number(val).toLocaleString('uz-UZ').replace(/,/g, ' ');
}

function renderContactBalancePill() {
  const isSubscriber = Boolean(state.user && state.user.plan_expires_at && new Date(state.user.plan_expires_at) > new Date());
  if (!state.user) {
    return `
      <a href="#/pricing" class="contacts-pill" title="${t('contacts_counter_title')}">
        🎁 117 ${t('free_contacts_badge')}
      </a>
    `;
  }

  if (isSubscriber) {
    return `
      <a href="#/pricing" class="contacts-pill pro" title="${t('unlimited_contacts_badge')}">
        ⭐ ${t('unlimited_contacts_badge')}
      </a>
    `;
  }

  const rem = Number(state.user.free_contacts_remaining ?? 117);
  return `
    <a href="#/pricing" class="contacts-pill ${rem <= 10 ? 'warning' : ''}" title="${t('contacts_counter_title')}">
      📱 <strong>${rem} / 117</strong>
    </a>
  `;
}

async function loadSubStatus() {
  if (!state.user) return;
  try {
    const res = await api('/api/subscriptions/my-status');
    state.subStatus = res;
    if (typeof res.free_contacts_remaining === 'number' && state.user) {
      state.user.free_contacts_remaining = res.free_contacts_remaining;
    }
  } catch (err) {
    // Non-blocking
  }
}

async function loadPricingData() {
  state.plansLoading = true;
  render();
  try {
    const plansRes = await api('/api/subscriptions/plans');
    state.plans = plansRes.plans || [];
    if (state.user) {
      await loadSubStatus();
    }
  } catch (err) {
    showToast(err.message || t('err_general'), 'error');
  } finally {
    state.plansLoading = false;
    render();
  }
}

async function handleUnlockContact(listingType, listingId) {
  if (!state.user) {
    navigate('/auth');
    return;
  }

  try {
    const res = await api('/api/subscriptions/unlock-contact', {
      method: 'POST',
      body: JSON.stringify({ listing_type: listingType, listing_id: listingId })
    });

    if (res.phone) {
      state.user.free_contacts_remaining = res.free_contacts_remaining;
      if (state.subStatus) {
        state.subStatus.free_contacts_remaining = res.free_contacts_remaining;
      }

      // Update listing in memory if present
      const targetListing = state.publicListings?.find(l => l.id === listingId);
      if (targetListing) {
        targetListing.phone = res.phone;
        targetListing.is_phone_unlocked = true;
      }
      const targetTruck = state.publicTransports?.find(t => t.id === listingId);
      if (targetTruck) {
        targetTruck.phone = res.phone;
        targetTruck.is_phone_unlocked = true;
      }
      if (state.currentListing && state.currentListing.id === listingId) {
        state.currentListing.phone = res.phone;
        state.currentListing.is_phone_unlocked = true;
      }

      render();
    }
  } catch (err) {
    if (err.status === 402 || (err.data && err.data.error === 'limit_exhausted')) {
      state.modal = { type: 'limit_exhausted' };
      render();
    } else {
      showToast(err.message || t('err_general'), 'error');
    }
  }
}

async function handleSubmitSubscriptionRequest(planId, receiptNote) {
  try {
    const res = await api('/api/subscriptions/request', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId, receipt_note: receiptNote })
    });
    showToast(t('sub_request_sent_success'), 'success');
    state.modal = null;
    await loadSubStatus();
    render();
  } catch (err) {
    showToast(err.message || t('err_general'), 'error');
  }
}

async function loadAdminStats() {
  try {
    const res = await api('/api/admin/stats');
    state.adminStats = res.stats || null;
  } catch (err) {
    console.error('Failed to load admin stats:', err);
  }
}

async function loadAdminUsers() {
  state.adminUsersLoading = true;
  try {
    const params = new URLSearchParams();
    if (state.adminUsersSearch) params.append('search', state.adminUsersSearch);
    if (state.adminRoleFilter && state.adminRoleFilter !== 'all') params.append('role', state.adminRoleFilter);
    const res = await api(`/api/admin/users?${params.toString()}`);
    state.adminUsers = res.users || [];
  } catch (err) {
    showToast(err.message || t('err_general'), 'error');
  } finally {
    state.adminUsersLoading = false;
  }
}

async function loadAdminListings() {
  state.adminListingsLoading = true;
  try {
    const res = await api('/api/admin/listings');
    state.adminListings = {
      cargo: res.cargo || [],
      transports: res.transports || []
    };
  } catch (err) {
    showToast(err.message || t('err_general'), 'error');
  } finally {
    state.adminListingsLoading = false;
  }
}

async function handleToggleUserVerify(userId, currentVerified) {
  try {
    const res = await api(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_verified: !currentVerified })
    });
    showToast(res.message || 'Foydalanuvchi yangilandi', 'success');
    await loadAdminUsers();
    await loadAdminStats();
    render();
  } catch (err) {
    showToast(err.message || t('err_general'), 'error');
  }
}

async function handleToggleUserBan(userId, currentBanned) {
  const confirmMsg = currentBanned ? t('confirm_unban_user') : t('confirm_ban_user');
  if (!confirm(confirmMsg)) return;

  try {
    const res = await api(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_banned: !currentBanned })
    });
    showToast(res.message || 'Foydalanuvchi holati yangilandi', 'success');
    await loadAdminUsers();
    await loadAdminStats();
    render();
  } catch (err) {
    showToast(err.message || t('err_general'), 'error');
  }
}

async function handleChangeUserRole(userId, newRole) {
  try {
    const res = await api(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role: newRole })
    });
    showToast(res.message || 'Foydalanuvchi roli yangilandi', 'success');
    await loadAdminUsers();
    render();
  } catch (err) {
    showToast(err.message || t('err_general'), 'error');
  }
}

async function handleAdminDeleteListing(type, id) {
  if (!confirm(t('confirm_delete_listing'))) return;

  try {
    const res = await api(`/api/admin/listings/${type}/${id}`, {
      method: 'DELETE'
    });
    showToast(t('listing_deleted_success'), 'success');
    await loadAdminListings();
    await loadAdminStats();
    render();
  } catch (err) {
    showToast(err.message || t('err_general'), 'error');
  }
}

async function loadConversationsAndActive() {
  if (!state.user) return;
  state.loading = true;
  render();

  try {
    const res = await api('/api/chat/conversations');
    state.conversations = res.conversations || [];

    // If no active conversation set but list is not empty and on desktop, select first
    if (!state.activeConversationId && state.conversations.length > 0 && window.innerWidth > 768) {
      state.activeConversationId = state.conversations[0].id;
    }

    if (state.activeConversationId) {
      await loadActiveConversation(state.activeConversationId);
    }
  } catch (err) {
    showToast(err.message || t('err_general'), 'error');
  } finally {
    state.loading = false;
    render();
    scrollChatToBottom();
  }
}

async function loadActiveConversation(convId) {
  try {
    const res = await api(`/api/chat/conversations/${convId}/messages`);
    state.activeConversationData = res;
    const conv = (state.conversations || []).find(c => c.id === convId);
    if (conv) {
      conv.unread_count = 0;
    }
    pollUnreadCount();
  } catch (err) {
    console.error('Failed to load active conversation:', err);
  }
}

async function silentRefreshActiveChat() {
  if (!state.activeConversationId) return;
  try {
    const res = await api(`/api/chat/conversations/${state.activeConversationId}/messages`);
    const prevMsgCount = state.activeConversationData?.messages?.length || 0;
    const newMsgCount = res.messages?.length || 0;

    state.activeConversationData = res;
    if (newMsgCount !== prevMsgCount) {
      updateChatMessagesDom();
      scrollChatToBottom();

      const convsRes = await api('/api/chat/conversations');
      state.conversations = convsRes.conversations || [];
      updateConversationsListDom();
      pollUnreadCount();
    }
  } catch (err) {
    // Silent
  }
}

function scrollChatToBottom(smooth = true) {
  setTimeout(() => {
    const area = document.getElementById('chat-messages-scroll');
    if (area) {
      if (smooth && area.scrollTo) {
        area.scrollTo({
          top: area.scrollHeight,
          behavior: 'smooth'
        });
      } else {
        area.scrollTop = area.scrollHeight;
      }
    }
  }, 50);
}

function updateChatMessagesDom() {
  const container = document.getElementById('chat-messages-scroll');
  if (!container || !state.activeConversationData) return;
  const messages = state.activeConversationData.messages || [];
  container.innerHTML = messages.length === 0 ? `
    <div style="text-align: center; color: var(--text-dim); margin: auto; font-size: 13px;">
      ${t('no_conversations_hint')}
    </div>
  ` : messages.map(msg => {
    const isSentByMe = msg.sender_id === state.user?.id;
    return `
      <div class="chat-bubble-row ${isSentByMe ? 'sent' : 'received'}">
        ${msg.offered_price ? `
          <div class="chat-offer-card">
            <div class="chat-offer-badge">
              <span>💰</span>
              <span>${t('offered_price_tag')}</span>
            </div>
            <div class="chat-offer-price">${Number(msg.offered_price).toLocaleString()} UZS</div>
          </div>
        ` : ''}
        <div class="chat-bubble">
          ${escapeHtml(msg.content)}
        </div>
        <div class="chat-msg-time">
          ${formatChatTime(msg.created_at)} ${isSentByMe ? (msg.is_read ? '✓✓' : '✓') : ''}
        </div>
      </div>
    `;
  }).join('');
}

function updateConversationsListDom() {
  const listEl = document.querySelector('.chat-conversations-list');
  if (!listEl) return;
  
  const filteredConvs = state.conversations.filter(c => {
    if (!state.chatFilter) return true;
    const term = state.chatFilter.toLowerCase();
    const otherName = c.other_user ? `${c.other_user.first_name || ''} ${c.other_user.last_name || ''}`.toLowerCase() : '';
    const origin = c.listing ? (c.listing.origin_city || c.listing.origin_locality || '') : '';
    const dest = c.listing ? (c.listing.destination_city || c.listing.destination_locality || '') : '';
    const title = c.listing ? (c.listing.cargo_name || c.listing.truck_model || '') : '';
    return otherName.includes(term) || origin.toLowerCase().includes(term) || dest.toLowerCase().includes(term) || title.toLowerCase().includes(term);
  });

  listEl.innerHTML = filteredConvs.length === 0 ? `
    <div style="padding: 32px 16px; text-align: center; color: var(--text-muted); font-size: 13px;">
      <div style="margin-bottom: 8px; opacity: 0.5;">${ICONS.chat}</div>
      <div>${t('no_conversations')}</div>
      <p style="font-size: 11px; color: var(--text-dim); margin-top: 4px;">${t('no_conversations_hint')}</p>
    </div>
  ` : filteredConvs.map(conv => {
    const isActive = conv.id === state.activeConversationId;
    const partner = conv.other_user;
    const partnerName = partner ? `${partner.first_name || ''} ${partner.last_name || ''}`.trim() || 'Foydalanuvchi' : 'Foydalanuvchi';
    const initials = partner ? ((partner.first_name?.[0] || '') + (partner.last_name?.[0] || '')).toUpperCase() || 'U' : 'U';

    let routeText = '';
    if (conv.listing) {
      const orig = conv.listing_type === 'cargo' 
        ? getLocalityLabel(conv.listing.origin_country, conv.listing.origin_locality, conv.listing.origin_custom)
        : getLocalityLabel(conv.listing.origin_country, conv.listing.origin_city);
      const dest = conv.listing_type === 'cargo'
        ? getLocalityLabel(conv.listing.destination_country, conv.listing.destination_locality, conv.listing.destination_custom)
        : (conv.listing.destination_country ? getLocalityLabel(conv.listing.destination_country, conv.listing.destination_city) : t('any_direction'));
      routeText = `${orig} → ${dest}`;
    }

    const snippet = conv.last_message || (conv.listing_type === 'cargo' ? conv.listing?.cargo_name : conv.listing?.truck_model) || '...';
    const timeStr = conv.last_message_at ? formatChatTime(conv.last_message_at) : formatDate(conv.created_at);

    return `
      <div class="chat-conv-item ${isActive ? 'active' : ''}" data-conv-id="${conv.id}">
        <div class="chat-conv-avatar">${initials}</div>
        <div class="chat-conv-info">
          <div class="chat-conv-header-row">
            <span class="chat-conv-name">${escapeHtml(partnerName)}</span>
            <span class="chat-conv-time">${timeStr}</span>
          </div>
          ${routeText ? `
            <div class="chat-conv-route-badge">📍 ${escapeHtml(routeText)}</div>
          ` : ''}
          <div class="chat-conv-snippet-row">
            <span class="chat-conv-snippet">${escapeHtml(snippet)}</span>
            ${conv.unread_count > 0 ? `<div class="chat-conv-unread-dot" title="${conv.unread_count} ${t('unread_badge')}"></div>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function handleSendMessage(content, offeredPrice = null) {
  if (!state.activeConversationId || state.chatSending) return;
  const text = (content || '').trim();
  if (!text && !offeredPrice) return;

  state.chatSending = true;
  try {
    const res = await api(`/api/chat/conversations/${state.activeConversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        content: text,
        offered_price: offeredPrice
      })
    });

    if (state.activeConversationData && state.activeConversationData.messages) {
      state.activeConversationData.messages.push(res.message);
    }
    state.chatMessageDraft = '';
    state.chatOfferInputVisible = false;
    state.chatOfferAmount = '';

    const conv = state.conversations.find(c => c.id === state.activeConversationId);
    if (conv) {
      conv.last_message = res.message.content;
      conv.last_message_at = res.message.created_at;
    }

    render();
    scrollChatToBottom();
  } catch (err) {
    showToast(err.message || t('err_general'), 'error');
  } finally {
    state.chatSending = false;
  }
}

async function startChatFromListing(listingType, listingId, receiverId) {
  if (!state.user) {
    navigate('/auth');
    return;
  }
  if (state.user.id === receiverId) {
    showToast(t('cannot_chat_with_self'), 'error');
    return;
  }

  try {
    const res = await api('/api/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({
        listing_type: listingType,
        listing_id: listingId,
        receiver_id: receiverId
      })
    });
    const convId = res.conversation.id;
    state.activeConversationId = convId;
    navigate(`/messages?id=${convId}`);
  } catch (err) {
    showToast(err.message || t('err_general'), 'error');
  }
}

function formatChatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  if (isToday) {
    return `${hours}:${minutes}`;
  }
  const day = d.getDate();
  const month = d.toLocaleDateString(getLanguage() === 'uz' ? 'uz-UZ' : getLanguage() === 'ru' ? 'ru-RU' : 'en-US', { month: 'short' });
  return `${day} ${month} ${hours}:${minutes}`;
}

// User Actions
async function handleLogin(email, password) {
  try {
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    state.user = res.user;
    if (state.user && state.user.phone) {
      state.publishTruckDraft.phone = state.user.phone;
    }
    showToast(t('profile_saved_success'), 'success');

    if (state.user) {
      pollUnreadCount();
      loadSubStatus();
      if (!state.unreadPollInterval) {
        state.unreadPollInterval = setInterval(pollUnreadCount, 15000);
      }
    }

    if (!state.user.profile_completed) {
      state.modal = { type: 'complete_profile' };
      render();
    } else {
      navigate('/cargo');
    }
  } catch (err) {
    showToast(err.message || t('err_general'), 'error');
  }
}

async function handleRegister(email, password) {
  try {
    const res = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    state.user = res.user;
    showToast(t('profile_saved_success'), 'success');

    if (state.user) {
      pollUnreadCount();
      loadSubStatus();
      if (!state.unreadPollInterval) {
        state.unreadPollInterval = setInterval(pollUnreadCount, 15000);
      }
    }

    state.modal = { type: 'complete_profile' };
    render();
  } catch (err) {
    showToast(err.message || t('err_general'), 'error');
  }
}

async function handleLogout() {
  try {
    await api('/api/auth/logout', { method: 'POST' });
    state.user = null;
    state.unreadCount = 0;
    if (state.unreadPollInterval) {
      clearInterval(state.unreadPollInterval);
      state.unreadPollInterval = null;
    }
    showToast(t('nav_logout'), 'info');
    navigate('/');
  } catch (err) {
    showToast(t('err_general'), 'error');
  }
}

async function handleProfileSave(data) {
  state.profileFormSubmitting = true;
  render();

  try {
    const res = await api('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    state.user = res.profile;
    state.modal = null;
    if (state.user && state.user.phone) {
      state.publishTruckDraft.phone = state.user.phone;
    }
    showToast(t('profile_saved_success'), 'success');
    render();
  } catch (err) {
    showToast(err.message || t('err_general'), 'error');
  } finally {
    state.profileFormSubmitting = false;
    render();
  }
}

async function handleListingPublish(data) {
  if (state.publishFormSubmitting) return;
  state.publishFormSubmitting = true;
  render();

  try {
    const res = await api('/api/listings', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    showToast(t('publish_success'), 'success');
    navigate(`/cargo/${res.listing.id}`);
  } catch (err) {
    if (err.data && err.data.error === 'profile_incomplete') {
      state.modal = { type: 'complete_profile' };
    } else {
      showToast(err.message || t('err_general'), 'error');
    }
  } finally {
    state.publishFormSubmitting = false;
    render();
  }
}

async function handleListingEditSave(id, data) {
  try {
    const res = await api(`/api/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    showToast(t('listing_reactivated_success'), 'success');
    state.modal = null;
    if (state.currentRoute === 'detail') {
      loadListingDetail(id);
    } else {
      loadMyListings();
    }
  } catch (err) {
    showToast(err.message || t('err_general'), 'error');
  }
}

async function handleListingStatusToggle(id, newStatus) {
  try {
    await api(`/api/listings/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: newStatus })
    });
    showToast(newStatus === 'closed' ? t('listing_closed_success') : t('listing_reactivated_success'), 'success');
    loadMyListings();
  } catch (err) {
    showToast(err.message || t('err_general'), 'error');
  }
}

// Transport Actions
async function handlePublishTruck(data) {
  if (state.publishTruckFormSubmitting) return;
  state.publishTruckFormSubmitting = true;
  render();

  try {
    await api('/api/transports', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    showToast(t('publish_truck_success'), 'success');
    navigate('/trucks');
  } catch (err) {
    if (err.data && err.data.error === 'profile_incomplete') {
      state.modal = { type: 'complete_profile' };
    } else {
      showToast(err.message || t('err_general'), 'error');
    }
  } finally {
    state.publishTruckFormSubmitting = false;
    render();
  }
}

async function handleDeleteTransport(id) {
  try {
    await api(`/api/transports/${id}`, { method: 'DELETE' });
    showToast(t('truck_deleted_success'), 'success');
    loadMyTransports();
  } catch (err) {
    showToast(err.message || t('err_general'), 'error');
  }
}

async function handleStatusToggleTransport(id, newStatus) {
  try {
    await api(`/api/transports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });
    showToast(newStatus === 'closed' ? t('truck_closed_success') : t('truck_reactivated_success'), 'success');
    loadMyTransports();
  } catch (err) {
    showToast(err.message || t('err_general'), 'error');
  }
}

// PWA Helper & Installation Functions
function isAppStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function renderPwaBanner() {
  if (isAppStandalone()) return '';
  const isDismissed = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('humo_pwa_banner_dismissed') === '1';
  if (isDismissed) return '';

  return `
    <div class="pwa-install-banner" id="pwa-install-banner">
      <div class="pwa-banner-content">
        <img src="/icons/icon-192.png" alt="Humo" class="pwa-banner-icon">
        <div class="pwa-banner-text">
          <div class="pwa-banner-title">${t('pwa_install_title')}</div>
          <div class="pwa-banner-desc">${t('pwa_install_desc')}</div>
        </div>
      </div>
      <div class="pwa-banner-actions">
        <button type="button" class="btn btn-primary btn-sm pwa-banner-install-btn" id="btn-pwa-banner-install">
          ${ICONS.download}
          <span>${t('pwa_install_btn')}</span>
        </button>
        <button type="button" class="pwa-banner-dismiss-btn" id="btn-pwa-banner-dismiss" title="${t('pwa_btn_later')}">✕</button>
      </div>
    </div>
  `;
}

async function triggerPwaInstall() {
  const isIos = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) && !window.MSStream;
  if (isAppStandalone()) {
    showToast(t('pwa_installed_success'), 'info');
    return;
  }

  if (window.deferredPrompt) {
    try {
      window.deferredPrompt.prompt();
      const choiceResult = await window.deferredPrompt.userChoice;
      if (choiceResult && choiceResult.outcome === 'accepted') {
        showToast(t('pwa_installed_success'), 'success');
        window.deferredPrompt = null;
        state.pwaCanInstall = false;
        state.showPwaBanner = false;
        render();
      }
    } catch (err) {
      console.warn('PWA install prompt error:', err);
    }
  } else {
    state.modal = { type: 'ios_install' };
    renderModal();
  }
}

// Render Functions
function renderMobileSlideDrawer() {
  const isDrawerOpen = state.mobileDrawerOpen;
  return `
    <!-- Mobile Slide-Over Drawer & Backdrop -->
    <div class="mobile-drawer-backdrop ${isDrawerOpen ? 'open' : ''}" id="mobile-drawer-backdrop"></div>
    <aside class="mobile-slide-drawer ${isDrawerOpen ? 'open' : ''}" id="mobile-slide-drawer">
      <div class="mobile-drawer-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <img src="/bird.png" alt="Humo" style="width: 28px; height: 28px; object-fit: contain;">
          <span style="font-weight: 800; font-size: 16px; color: #fff;">Humo Logistics</span>
        </div>
        <button type="button" class="mobile-drawer-close" id="btn-close-mobile-drawer" title="${t('close')}">✕</button>
      </div>

      <div class="mobile-drawer-user-card">
        ${state.user ? `
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="user-avatar-circle" style="width: 44px; height: 44px; font-size: 16px;">
              ${(state.user.first_name ? state.user.first_name[0] : state.user.email[0]).toUpperCase()}
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-weight: 700; font-size: 14px; color: #fff; display: flex; align-items: center; gap: 4px;">
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${state.user.first_name ? `${state.user.first_name} ${state.user.last_name || ''}` : state.user.email}</span>
                ${state.user.is_verified ? `<span class="verified-badge" style="font-size: 10px; padding: 1px 5px;" title="${t('badge_verified')}">✓</span>` : ''}
              </div>
              <div style="font-size: 12px; color: var(--accent-secondary); margin-top: 2px;">
                ${state.user.role ? getRoleLabel(state.user.role) : t('profile_status_incomplete')}
              </div>
            </div>
          </div>
          <div style="margin-top: 10px;">
            ${renderContactBalancePill()}
          </div>
        ` : `
          <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 10px; line-height: 1.4;">
            ${t('hero_subtitle')}
          </div>
          <a href="#/auth" class="btn btn-primary btn-sm mobile-drawer-link" style="width: 100%; justify-content: center;">
            ${t('nav_login')} / ${t('nav_register')}
          </a>
        `}
      </div>

      <div class="mobile-drawer-nav">
        <a href="#/publish" class="mobile-drawer-link ${state.currentRoute === 'publish' ? 'active' : ''}">
          ${ICONS.add}
          <span>${t('nav_publish')}</span>
        </a>
        <a href="#/publish-truck" class="mobile-drawer-link ${state.currentRoute === 'publish-truck' ? 'active' : ''}">
          ${ICONS.addTruck}
          <span>${t('nav_publish_truck')}</span>
        </a>
        ${state.user ? `
          <a href="#/my-listings" class="mobile-drawer-link ${state.currentRoute === 'my-listings' ? 'active' : ''}">
            ${ICONS.list}
            <span>${t('nav_my_listings')}</span>
          </a>
        ` : ''}
        <a href="#/pricing" class="mobile-drawer-link ${state.currentRoute === 'pricing' ? 'active' : ''}">
          ${ICONS.creditCard}
          <span>${t('nav_pricing')}</span>
        </a>
        ${state.user && state.user.role === 'admin' ? `
          <a href="#/admin" class="mobile-drawer-link ${state.currentRoute === 'admin' ? 'active' : ''}" style="color: var(--accent-primary);">
            ${ICONS.shieldCheck}
            <span>${t('nav_admin')}</span>
          </a>
        ` : ''}
        ${state.user ? `
          <a href="#/profile" class="mobile-drawer-link ${state.currentRoute === 'profile' ? 'active' : ''}">
            ${ICONS.user}
            <span>${t('nav_profile')}</span>
          </a>
        ` : ''}
      </div>

      <div class="mobile-drawer-section">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-dim); margin-bottom: 8px; font-weight: 700;">
          ${t('lang_title') || 'Til'}
        </div>
        <div class="lang-selector" style="width: 100%; justify-content: space-between;">
          <button class="lang-btn ${getLanguage() === 'uz' ? 'active' : ''}" data-lang="uz" style="flex: 1; text-align: center;">O‘zb</button>
          <button class="lang-btn ${getLanguage() === 'ru' ? 'active' : ''}" data-lang="ru" style="flex: 1; text-align: center;">Рус</button>
          <button class="lang-btn ${getLanguage() === 'en' ? 'active' : ''}" data-lang="en" style="flex: 1; text-align: center;">Eng</button>
        </div>
      </div>

      <!-- PWA App Install Button in Drawer -->
      <div class="mobile-drawer-section pwa-drawer-section" style="padding-top: 6px; padding-bottom: 6px;">
        <button type="button" class="btn btn-outline btn-sm pwa-install-btn" id="btn-pwa-install-drawer" style="width: 100%; justify-content: center; gap: 8px; border-color: rgba(249, 115, 22, 0.45); background: rgba(249, 115, 22, 0.1); color: var(--accent-primary); font-weight: 700;">
          ${ICONS.download}
          <span>${t('pwa_install_btn')}</span>
        </button>
      </div>

      ${state.user ? `
        <div style="padding: 16px; margin-top: auto; border-top: 1px solid var(--surface-border-subtle);">
          <button type="button" class="btn btn-outline btn-sm" id="btn-logout-drawer" style="width: 100%; justify-content: center; color: var(--danger-text); border-color: rgba(239, 68, 68, 0.3);">
            ${ICONS.logout}
            <span>${t('nav_logout')}</span>
          </button>
        </div>
      ` : ''}
    </aside>
  `;
}

function render() {
  const root = document.getElementById('app-root');
  if (!root) return;

  root.innerHTML = `
    <!-- Desktop Left Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <img src="/bird.png" alt="Humo Logistics Bird" class="brand-logo-img">
        <div class="brand-text-block">
          <span class="brand-title">Humo Logistics</span>
          <span class="brand-subtitle">Uzbekistan Freight</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <a class="nav-item ${state.currentRoute === 'home' ? 'active' : ''}" href="#/">
          ${ICONS.home}
          <span>${t('nav_home')}</span>
        </a>
        <a class="nav-item ${state.currentRoute === 'cargo' ? 'active' : ''}" href="#/cargo">
          ${ICONS.truck}
          <span>${t('nav_cargo')}</span>
        </a>
        <a class="nav-item ${state.currentRoute === 'trucks' ? 'active' : ''}" href="#/trucks">
          ${ICONS.steering}
          <span>${t('nav_trucks')}</span>
        </a>
        <a class="nav-item ${state.currentRoute === 'publish' ? 'active' : ''}" href="#/publish">
          ${ICONS.add}
          <span>${t('nav_publish')}</span>
        </a>
        <a class="nav-item ${state.currentRoute === 'publish-truck' ? 'active' : ''}" href="#/publish-truck">
          ${ICONS.addTruck}
          <span>${t('nav_publish_truck')}</span>
        </a>
        <a class="nav-item ${state.currentRoute === 'pricing' ? 'active' : ''}" href="#/pricing">
          ${ICONS.creditCard}
          <span>${t('nav_pricing')}</span>
        </a>
        ${state.user ? `
          <a class="nav-item ${state.currentRoute === 'messages' ? 'active' : ''}" href="#/messages" style="display: flex; align-items: center;">
            ${ICONS.chat}
            <span>${t('nav_messages')}</span>
            <span class="nav-badge chat-unread-badge" style="${state.unreadCount > 0 ? '' : 'display: none;'}">${state.unreadCount}</span>
          </a>
          <a class="nav-item ${state.currentRoute === 'my-listings' ? 'active' : ''}" href="#/my-listings">
            ${ICONS.list}
            <span>${t('nav_my_listings')}</span>
          </a>
          <a class="nav-item ${state.currentRoute === 'profile' ? 'active' : ''}" href="#/profile">
            ${ICONS.user}
            <span>${t('nav_profile')}</span>
          </a>
          ${state.user.role === 'admin' ? `
            <a class="nav-item ${state.currentRoute === 'admin' ? 'active' : ''}" href="#/admin" style="color: var(--accent-primary);">
              ${ICONS.shieldCheck}
              <span>${t('nav_admin')}</span>
            </a>
          ` : ''}
        ` : ''}
      </nav>

      <div class="sidebar-pwa-box desktop-only" id="sidebar-pwa-box">
        <button type="button" class="btn btn-outline btn-sm pwa-install-btn" id="btn-pwa-install-sidebar" style="width: 100%; justify-content: center; gap: 8px; border-color: rgba(249, 115, 22, 0.4); background: rgba(249, 115, 22, 0.08); color: var(--accent-primary); font-size: 12px; font-weight: 700;">
          ${ICONS.download}
          <span>${t('pwa_install_btn')}</span>
        </button>
      </div>

      <div class="sidebar-footer">
        ${state.user ? `
          <div class="user-sidebar-card">
            <div class="user-avatar-circle">
              ${(state.user.first_name ? state.user.first_name[0] : state.user.email[0]).toUpperCase()}
            </div>
            <div class="user-info-text">
              <div class="user-name" style="display: flex; align-items: center; gap: 4px;">
                <span>${state.user.first_name ? `${state.user.first_name} ${state.user.last_name || ''}` : state.user.email}</span>
                ${state.user.is_verified ? `<span class="verified-badge" style="font-size: 10px; padding: 1px 5px;" title="${t('badge_verified')}">✓</span>` : ''}
              </div>
              <div class="user-role-badge">${state.user.role ? getRoleLabel(state.user.role) : t('profile_status_incomplete')}</div>
            </div>
            <button class="btn btn-outline btn-sm" id="btn-logout-sidebar" title="${t('nav_logout')}">
              ${ICONS.logout}
            </button>
          </div>
        ` : `
          <a href="#/auth" class="btn btn-primary" style="width: 100%;">
            ${t('nav_login')}
          </a>
        `}
      </div>
    </aside>

    <!-- Main Wrapper -->
    <div class="main-wrapper">
      <!-- PWA Install Banner -->
      ${renderPwaBanner()}

      <!-- Top Sticky Header -->
      <header class="top-header">
        <div class="header-left">
          <a href="#/" style="display: flex; align-items: center; gap: 8px;">
            <img src="/bird.png" alt="Humo" style="width: 32px; height: 32px; object-fit: contain;">
            <span style="font-weight: 800; font-size: 16px; color: #fff;">Humo Logistics</span>
          </a>
        </div>

        <div class="header-right">
          ${renderContactBalancePill()}

          <button type="button" class="btn btn-outline btn-sm pwa-header-btn desktop-only" id="btn-pwa-install-header" style="gap: 6px; border-color: rgba(249, 115, 22, 0.4); background: rgba(249, 115, 22, 0.08); color: var(--accent-primary); font-size: 12px; font-weight: 700;">
            ${ICONS.download}
            <span>${t('pwa_install_btn')}</span>
          </button>

          <!-- Language Selector -->
          <div class="lang-selector">
            <button class="lang-btn ${getLanguage() === 'uz' ? 'active' : ''}" data-lang="uz">O‘zb</button>
            <button class="lang-btn ${getLanguage() === 'ru' ? 'active' : ''}" data-lang="ru">Рус</button>
            <button class="lang-btn ${getLanguage() === 'en' ? 'active' : ''}" data-lang="en">Eng</button>
          </div>

          ${state.user ? `
            <a href="#/profile" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 6px;">
              ${ICONS.user}
              <span class="desktop-only">${state.user.first_name || state.user.email.split('@')[0]}</span>
            </a>
          ` : `
            <a href="#/auth" class="btn btn-primary btn-sm">
              ${t('nav_login')}
            </a>
          `}
        </div>
      </header>

      <!-- Page Content -->
      <main class="page-container">
        ${renderCurrentPage()}
      </main>

      <!-- Site Footer -->
      ${renderFooter()}
    </div>

    <!-- Floating Support Extension / Widget -->
    ${renderFloatingSupportWidget()}

    <!-- Stage 3: Humo AI Dispatcher Floating Widget -->
    ${renderAiDispatcherWidget()}

    <!-- Mobile Slide-Over Drawer -->
    ${renderMobileSlideDrawer()}

    <!-- Mobile Bottom Navigation (5 Core Tabs) -->
    <nav class="mobile-bottom-nav">
      <a class="mobile-nav-item ${state.currentRoute === 'home' ? 'active' : ''}" href="#/">
        ${ICONS.home}
        <span>${t('nav_home')}</span>
      </a>
      <a class="mobile-nav-item ${state.currentRoute === 'cargo' ? 'active' : ''}" href="#/cargo">
        ${ICONS.truck}
        <span>${t('nav_cargo')}</span>
      </a>
      <a class="mobile-nav-item ${state.currentRoute === 'trucks' ? 'active' : ''}" href="#/trucks">
        ${ICONS.steering}
        <span>${t('nav_trucks')}</span>
      </a>
      <a class="mobile-nav-item ${state.currentRoute === 'messages' ? 'active' : ''}" href="${state.user ? '#/messages' : '#/auth'}" style="position: relative;">
        ${ICONS.chat}
        <span>${t('nav_messages')}</span>
        <span class="nav-badge chat-unread-badge" style="position: absolute; top: 3px; right: 18%; padding: 1px 5px; font-size: 10px; ${state.unreadCount > 0 ? '' : 'display: none;'}">${state.unreadCount}</span>
      </a>
      <button type="button" class="mobile-nav-item ${['profile', 'publish', 'publish-truck', 'my-listings', 'pricing', 'admin'].includes(state.currentRoute) ? 'active' : ''}" id="btn-toggle-mobile-drawer">
        ${ICONS.menu}
        <span>${t('nav_menu')}</span>
      </button>
    </nav>
  `;

  renderModal();
  bindEvents();
}

function renderCurrentPage() {
  switch (state.currentRoute) {
    case 'home':
      return renderHomePage();
    case 'cargo':
      return renderCargoPage();
    case 'trucks':
      return renderTrucksPage();
    case 'messages':
      return renderMessagesPage();
    case 'detail':
      return renderDetailPage();
    case 'publish':
      return renderPublishPage();
    case 'publish-truck':
      return renderPublishTruckPage();
    case 'my-listings':
      return renderMyListingsPage();
    case 'profile':
      return renderProfilePage();
    case 'admin':
      return renderAdminPage();
    case 'pricing':
      return renderPricingPage();
    case 'auth':
      return renderAuthPage();
    default:
      return renderHomePage();
  }
}

// 1. Home Page View
function renderHomePage() {
  return `
    <section class="hero-banner">
      <img src="/bird.png" alt="Watermark" class="hero-watermark">
      <div class="hero-content">
        <div class="hero-badge">
          <span>🇺🇿 Humo Logistics</span>
          <span>•</span>
          <span>${t('brand_tagline')}</span>
        </div>
        <h1 class="hero-title">${t('hero_title')}</h1>
        <p class="hero-subtitle">${t('hero_subtitle')}</p>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <a href="#/cargo" class="btn btn-primary">
            ${ICONS.search}
            <span>${t('hero_find_cargo')}</span>
          </a>
          <a href="#/trucks" class="btn btn-secondary">
            ${ICONS.steering}
            <span>${t('hero_find_trucks')}</span>
          </a>
          <a href="#/publish" class="btn btn-outline">
            ${ICONS.add}
            <span>${t('nav_publish')}</span>
          </a>
          <a href="#/publish-truck" class="btn btn-outline">
            ${ICONS.addTruck}
            <span>${t('nav_publish_truck')}</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Segmented Tabs for Home: Cargo vs Trucks -->
    <div style="display: flex; justify-content: flex-start; margin-bottom: 8px;">
      <div class="segmented-tabs">
        <button class="tab-btn ${state.homeTab === 'cargo' ? 'active' : ''}" id="home-toggle-cargo">
          ${ICONS.truck}
          <span>${t('tab_cargo')}</span>
        </button>
        <button class="tab-btn ${state.homeTab === 'trucks' ? 'active' : ''}" id="home-toggle-trucks">
          ${ICONS.steering}
          <span>${t('tab_trucks')}</span>
        </button>
      </div>
    </div>

    ${state.homeTab === 'cargo' ? `
      ${renderSearchBox()}
      ${renderListingsSection()}
    ` : `
      ${renderTruckSearchBox(true)}
      ${renderTrucksSection()}
    `}
  `;
}

// 2. Cargo Marketplace Search Page View
function renderCargoPage() {
  return `
    <div style="margin-bottom: 20px;">
      <h2 style="font-size: 22px; font-weight: 800; color: #fff;">${t('search_title')}</h2>
      <p style="font-size: 13px; color: var(--text-muted);">${t('hero_subtitle')}</p>
    </div>

    ${renderSearchBox()}
    ${renderListingsSection()}
  `;
}

// 3. Find Trucks Marketplace Page View
function renderTrucksPage() {
  return `
    <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
      <div>
        <h2 style="font-size: 22px; font-weight: 800; color: #fff;">${t('search_trucks_title')}</h2>
        <p style="font-size: 13px; color: var(--text-muted);">${t('search_trucks_subtitle')}</p>
      </div>
      <a href="#/publish-truck" class="btn btn-primary btn-sm">
        ${ICONS.addTruck}
        <span>${t('nav_publish_truck')}</span>
      </a>
    </div>

    ${renderTruckSearchBox(false)}
    ${renderTrucksSection()}
  `;
}

// Cargo Search Box Component
function renderSearchBox() {
  const originCountry = state.searchFilters.origin_country;
  const originCountryObj = state.metadata.locations.find(c => c.code === originCountry);
  const destCountry = state.searchFilters.destination_country;
  const destCountryObj = state.metadata.locations.find(c => c.code === destCountry);

  return `
    <div class="search-card">
      <div class="search-grid">
        <!-- Origin Country & Locality -->
        <div class="form-group">
          <label class="form-label">${t('filter_origin')}</label>
          <div style="display: flex; gap: 6px; flex-direction: column;">
            <select class="form-select" id="search-origin-country">
              <option value="">${t('filter_country')} (Barchasi)</option>
              ${state.metadata.locations.map(c => `
                <option value="${c.code}" ${c.code === originCountry ? 'selected' : ''}>
                  ${getLocalizedName(c)}
                </option>
              `).join('')}
            </select>

            <select class="form-select" id="search-origin-locality" ${!originCountry ? 'disabled' : ''}>
              <option value="">${originCountry ? t('filter_locality') + ' (Barchasi)' : t('select_country_first')}</option>
              ${originCountryObj ? originCountryObj.localities.map(l => `
                <option value="${l.id}" ${state.searchFilters.origin_locality === l.id ? 'selected' : ''}>
                  ${getLocalizedName(l)}
                </option>
              `).join('') : ''}
              ${originCountry ? `
                <option value="__custom__" ${state.searchFilters.origin_locality === '__custom__' ? 'selected' : ''}>
                  ✦ ${t('filter_custom_locality_label')}
                </option>
              ` : ''}
            </select>

            ${state.searchFilters.origin_locality === '__custom__' ? `
              <input type="text" class="form-input" id="search-origin-custom" 
                placeholder="${t('filter_manual_locality_placeholder')}" 
                value="${state.searchFilters.origin_custom || ''}">
            ` : ''}
          </div>
        </div>

        <!-- Swap Button -->
        <div class="swap-btn-container">
          <button class="swap-btn" id="btn-swap-filters" title="${t('btn_swap')}">
            ${ICONS.swap}
          </button>
        </div>

        <!-- Destination Country & Locality -->
        <div class="form-group">
          <label class="form-label">${t('filter_destination')}</label>
          <div style="display: flex; gap: 6px; flex-direction: column;">
            <select class="form-select" id="search-dest-country">
              <option value="">${t('filter_country')} (Barchasi)</option>
              ${state.metadata.locations.map(c => `
                <option value="${c.code}" ${c.code === destCountry ? 'selected' : ''}>
                  ${getLocalizedName(c)}
                </option>
              `).join('')}
            </select>

            <select class="form-select" id="search-dest-locality" ${!destCountry ? 'disabled' : ''}>
              <option value="">${destCountry ? t('filter_locality') + ' (Barchasi)' : t('select_country_first')}</option>
              ${destCountryObj ? destCountryObj.localities.map(l => `
                <option value="${l.id}" ${state.searchFilters.destination_locality === l.id ? 'selected' : ''}>
                  ${getLocalizedName(l)}
                </option>
              `).join('') : ''}
              ${destCountry ? `
                <option value="__custom__" ${state.searchFilters.destination_locality === '__custom__' ? 'selected' : ''}>
                  ✦ ${t('filter_custom_locality_label')}
                </option>
              ` : ''}
            </select>

            ${state.searchFilters.destination_locality === '__custom__' ? `
              <input type="text" class="form-input" id="search-dest-custom" 
                placeholder="${t('filter_manual_locality_placeholder')}" 
                value="${state.searchFilters.destination_custom || ''}">
            ` : ''}
          </div>
        </div>

        <!-- Body Type Filter -->
        <div class="form-group form-group-body-type">
          <label class="form-label">${t('filter_body_type')}</label>
          <select class="form-select" id="search-body-type">
            <option value="">${t('filter_all_body_types')}</option>
            ${state.metadata.body_types.map(b => `
              <option value="${b.id}" ${state.searchFilters.body_type === b.id ? 'selected' : ''}>
                ${getLocalizedName(b)}
              </option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- Action Row -->
      <div class="search-actions-row">
        <div class="search-actions-left">
          <span class="form-label" style="margin-bottom: 0;">${t('sort_by')}:</span>
          <select class="form-select" id="search-sort" style="width: auto; padding: 6px 10px; font-size: 13px;">
            <option value="newest" ${state.searchFilters.sort === 'newest' ? 'selected' : ''}>${t('sort_newest')}</option>
            <option value="weight_asc" ${state.searchFilters.sort === 'weight_asc' ? 'selected' : ''}>${t('sort_weight_asc')}</option>
            <option value="weight_desc" ${state.searchFilters.sort === 'weight_desc' ? 'selected' : ''}>${t('sort_weight_desc')}</option>
          </select>
        </div>

        <div class="search-actions-right">
          <button class="btn btn-outline btn-sm" id="btn-clear-filters">
            ${t('btn_clear')}
          </button>
          <button class="btn btn-primary btn-sm" id="btn-apply-search">
            ${ICONS.search}
            <span>${t('btn_search')}</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

// Truck Search Box Component
function renderTruckSearchBox(isHome = false) {
  const originCountry = state.truckSearchFilters.origin_country;
  const originCountryObj = state.metadata.locations.find(c => c.code === originCountry);
  const destCountry = state.truckSearchFilters.destination_country;
  const destCountryObj = destCountry && destCountry !== 'ANY' ? state.metadata.locations.find(c => c.code === destCountry) : null;

  return `
    <div class="search-card">
      <div class="search-grid">
        <!-- Origin Country & Locality -->
        <div class="form-group">
          <label class="form-label">${t('filter_origin')}</label>
          <div style="display: flex; gap: 6px; flex-direction: column;">
            <select class="form-select" id="search-truck-origin-country">
              <option value="">${t('filter_country')} (Barchasi)</option>
              ${state.metadata.locations.map(c => `
                <option value="${c.code}" ${c.code === originCountry ? 'selected' : ''}>
                  ${getLocalizedName(c)}
                </option>
              `).join('')}
            </select>

            <select class="form-select" id="search-truck-origin-city" ${!originCountry ? 'disabled' : ''}>
              <option value="">${originCountry ? t('filter_locality') + ' (Barchasi)' : t('select_country_first')}</option>
              ${originCountryObj ? originCountryObj.localities.map(l => `
                <option value="${l.id}" ${state.truckSearchFilters.origin_city === l.id ? 'selected' : ''}>
                  ${getLocalizedName(l)}
                </option>
              `).join('') : ''}
              ${originCountry ? `
                <option value="__custom__" ${state.truckSearchFilters.origin_city === '__custom__' ? 'selected' : ''}>
                  ✦ ${t('filter_custom_locality_label')}
                </option>
              ` : ''}
            </select>

            ${state.truckSearchFilters.origin_city === '__custom__' ? `
              <input type="text" class="form-input" id="search-truck-origin-custom" 
                placeholder="${t('filter_manual_locality_placeholder')}" 
                value="${state.truckSearchFilters.origin_custom || ''}">
            ` : ''}
          </div>
        </div>

        <!-- Swap Button -->
        <div class="swap-btn-container">
          <button class="swap-btn" id="btn-swap-truck-filters" title="${t('btn_swap')}">
            ${ICONS.swap}
          </button>
        </div>

        <!-- Destination Country & Locality -->
        <div class="form-group">
          <label class="form-label">${t('filter_destination')}</label>
          <div style="display: flex; gap: 6px; flex-direction: column;">
            <select class="form-select" id="search-truck-dest-country">
              <option value="">${t('filter_any_destination')}</option>
              ${state.metadata.locations.map(c => `
                <option value="${c.code}" ${c.code === destCountry ? 'selected' : ''}>
                  ${getLocalizedName(c)}
                </option>
              `).join('')}
            </select>

            <select class="form-select" id="search-truck-dest-city" ${!destCountry ? 'disabled' : ''}>
              <option value="">${destCountry ? t('filter_locality') + ' (Barchasi)' : t('select_country_first')}</option>
              ${destCountryObj ? destCountryObj.localities.map(l => `
                <option value="${l.id}" ${state.truckSearchFilters.destination_city === l.id ? 'selected' : ''}>
                  ${getLocalizedName(l)}
                </option>
              `).join('') : ''}
              ${destCountry ? `
                <option value="__custom__" ${state.truckSearchFilters.destination_city === '__custom__' ? 'selected' : ''}>
                  ✦ ${t('filter_custom_locality_label')}
                </option>
              ` : ''}
            </select>

            ${state.truckSearchFilters.destination_city === '__custom__' ? `
              <input type="text" class="form-input" id="search-truck-dest-custom" 
                placeholder="${t('filter_manual_locality_placeholder')}" 
                value="${state.truckSearchFilters.destination_custom || ''}">
            ` : ''}
          </div>
        </div>

        <!-- Body Type Filter -->
        <div class="form-group form-group-body-type">
          <label class="form-label">${t('filter_body_type')}</label>
          <select class="form-select" id="search-truck-body-type">
            <option value="">${t('filter_all_body_types')}</option>
            ${state.metadata.body_types.map(b => `
              <option value="${b.id}" ${state.truckSearchFilters.body_type === b.id ? 'selected' : ''}>
                ${getLocalizedName(b)}
              </option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- Action Row -->
      <div class="search-actions-row">
        <div class="search-actions-left">
          <span class="form-label" style="margin-bottom: 0;">${t('sort_by')}:</span>
          <select class="form-select" id="search-truck-sort" style="width: auto; padding: 6px 10px; font-size: 13px;">
            <option value="newest" ${state.truckSearchFilters.sort === 'newest' ? 'selected' : ''}>${t('sort_newest')}</option>
            <option value="weight_desc" ${state.truckSearchFilters.sort === 'weight_desc' ? 'selected' : ''}>${t('sort_weight_desc')}</option>
            <option value="weight_asc" ${state.truckSearchFilters.sort === 'weight_asc' ? 'selected' : ''}>${t('sort_weight_asc')}</option>
          </select>
        </div>

        <div class="search-actions-right">
          <button class="btn btn-outline btn-sm" id="btn-clear-truck-filters">
            ${t('btn_clear')}
          </button>
          <button class="btn btn-primary btn-sm" id="btn-apply-truck-search">
            ${ICONS.search}
            <span>${t('btn_search')}</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

// Cargo Listings Section
function renderListingsSection() {
  if (state.loading) {
    return `
      <div style="text-align: center; padding: 40px; color: var(--text-muted);">
        ${t('btn_saving')}
      </div>
    `;
  }

  const listings = state.publicListings;

  return `
    <div class="listings-header">
      <div class="listings-title">${t('nav_cargo')}</div>
      <div class="listings-count">${t('results_count', { count: listings.length })}</div>
    </div>

    ${listings.length === 0 ? `
      <div class="empty-state">
        <div class="empty-state-icon">${ICONS.truck}</div>
        <div class="empty-state-title">${t('no_listings_found')}</div>
        <div class="empty-state-text">${t('no_listings_hint')}</div>
        <a href="#/publish" class="btn btn-primary" style="margin-top: 8px;">
          ${ICONS.add}
          <span>${t('btn_add_first_cargo')}</span>
        </a>
      </div>
    ` : `
      <div class="listings-grid">
        ${listings.map(item => renderListingCard(item)).join('')}
      </div>
    `}
  `;
}

// Truck Listings Section
function renderTrucksSection() {
  if (state.loading) {
    return `
      <div style="text-align: center; padding: 40px; color: var(--text-muted);">
        ${t('btn_saving')}
      </div>
    `;
  }

  const transports = state.publicTransports;

  return `
    <div class="listings-header">
      <div class="listings-title">${t('nav_trucks')}</div>
      <div class="listings-count">${t('trucks_results_count', { count: transports.length })}</div>
    </div>

    ${transports.length === 0 ? `
      <div class="empty-state">
        <div class="empty-state-icon">${ICONS.steering}</div>
        <div class="empty-state-title">${t('no_trucks_found')}</div>
        <div class="empty-state-text">${t('no_trucks_hint')}</div>
        <a href="#/publish-truck" class="btn btn-primary" style="margin-top: 8px;">
          ${ICONS.addTruck}
          <span>${t('btn_add_first_truck')}</span>
        </a>
      </div>
    ` : `
      <div class="listings-grid">
        ${transports.map(item => renderTruckCard(item)).join('')}
      </div>
    `}
  `;
}

function renderListingCard(item) {
  const originLoc = getLocalityLabel(item.origin_country, item.origin_locality, item.origin_custom);
  const destLoc = getLocalityLabel(item.destination_country, item.destination_locality, item.destination_custom);
  const originC = getCountryLabel(item.origin_country);
  const destC = getCountryLabel(item.destination_country);

  return `
    <div class="cargo-card" onclick="window.location.hash = '#/cargo/${item.id}'">
      <div class="cargo-card-top">
        <div class="cargo-route">
          <span>${originLoc} (${originC})</span>
          <span class="route-arrow">${ICONS.arrowRight}</span>
          <span>${destLoc} (${destC})</span>
        </div>
        <div class="cargo-price-badge">
          ${formatPrice(item)}
        </div>
      </div>

      <div class="cargo-card-body">
        <div class="cargo-details-left">
          <div class="cargo-name-text">${escapeHtml(item.cargo_name)}</div>
          <div class="cargo-specs-tags">
            <span class="spec-tag">
              <strong>${item.weight}</strong> ${t('weight_unit')}
            </span>
            ${item.volume ? `
              <span class="spec-tag">
                <strong>${item.volume}</strong> ${t('volume_unit')}
              </span>
            ` : ''}
            <span class="spec-tag">
              ${getBodyTypeLabel(item.body_type)}
            </span>
            <span class="spec-tag" style="color: var(--accent-secondary);">
              ${item.loading_date_type === 'ready_now' ? t('ready_to_load') : `${t('loading_date_prefix')} ${formatDate(item.loading_date)}`}
            </span>
          </div>
        </div>
      </div>

      <div class="cargo-card-footer">
        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
          <span>${t('posted_on')}: ${formatDate(item.created_at)}</span>
          ${item.owner_verified ? `
            <span class="verified-badge" title="${t('badge_verified')}">✓ ${t('badge_verified')}</span>
          ` : ''}
          ${item.owner_role ? `<span style="font-size: 11px; color: var(--text-dim);">• ${getRoleLabel(item.owner_role)}</span>` : ''}
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          ${item.phone ? `
            ${item.is_phone_unlocked ? `
              <a href="tel:${escapeHtml(item.phone)}" class="btn-phone" onclick="event.stopPropagation();" title="${t('call_contact')}">
                ${ICONS.phone}
                <span>${escapeHtml(item.phone)}</span>
              </a>
            ` : `
              <button class="btn btn-phone btn-unlock-phone" data-type="cargo" data-id="${item.id}" onclick="event.stopPropagation();" title="${t('btn_reveal_phone')}">
                ${ICONS.phone}
                <span>${escapeHtml(item.phone)}</span>
                <span class="unlock-badge-pill">${t('btn_reveal_phone')}</span>
              </button>
            `}
          ` : ''}
          <button type="button" class="btn btn-sm btn-find-matches" data-type="cargo" data-id="${item.id}" onclick="event.stopPropagation();" title="${t('ai_find_matches_trucks')}">
            <span class="btn-match-icon">${ICONS.radar}</span>
            <span>${t('ai_find_matches_trucks')}</span>
          </button>
          ${(!state.user || state.user.id !== item.user_id) ? `
            <button class="btn btn-chat-action btn-sm btn-cargo-chat" data-id="${item.id}" data-owner="${item.user_id}" title="${t('btn_message_owner')}">
              ${ICONS.chat}
              <span>${t('btn_message_owner')}</span>
            </button>
          ` : ''}
          <span class="badge ${item.status === 'active' ? 'badge-active' : 'badge-closed'}">
            ${item.status === 'active' ? t('status_active') : t('status_closed')}
          </span>
          <span style="color: var(--accent-primary); font-weight: 600;">
            ${t('btn_view_details')} →
          </span>
        </div>
      </div>
    </div>
  `;
}

function renderTruckCard(item, isMyList = false) {
  const originLoc = getLocalityLabel(item.origin_country, item.origin_city);
  const originC = getCountryLabel(item.origin_country);
  
  let destText = '';
  if (item.destination_country && item.destination_country !== 'ANY') {
    const destLoc = getLocalityLabel(item.destination_country, item.destination_city);
    const destC = getCountryLabel(item.destination_country);
    destText = destLoc ? `${destLoc} (${destC})` : destC;
  } else {
    destText = `<span style="color: var(--accent-secondary); font-style: italic;">✦ ${t('any_direction')}</span>`;
  }

  const isRevealed = state.revealedPhones[item.id];
  const driverName = (item.owner_first_name || item.owner_last_name) 
    ? `${item.owner_first_name || ''} ${item.owner_last_name || ''}`.trim()
    : '';

  return `
    <div class="cargo-card" style="cursor: default;">
      <div class="cargo-card-top">
        <div class="cargo-route">
          <span>${originLoc} (${originC})</span>
          <span class="route-arrow">${ICONS.arrowRight}</span>
          <span>${destText}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          ${item.truck_model ? `
            <span class="truck-model-tag">${ICONS.steering} ${escapeHtml(item.truck_model)}</span>
          ` : ''}
          <span class="badge ${item.status === 'active' ? 'badge-active' : 'badge-closed'}">
            ${item.status === 'active' ? t('status_active') : t('status_closed')}
          </span>
        </div>
      </div>

      <div class="cargo-card-body">
        <div class="cargo-details-left">
          <div class="cargo-specs-tags">
            <span class="spec-tag">${getBodyTypeLabel(item.body_type)}</span>
            <span class="spec-tag">
              ${t('truck_capacity')}: <strong>${item.max_weight}</strong> ${t('weight_unit')}
            </span>
            ${item.volume ? `
              <span class="spec-tag">
                ${t('truck_volume')}: <strong>${item.volume}</strong> ${t('volume_unit')}
              </span>
            ` : ''}
            <span class="spec-tag" style="color: var(--accent-secondary);">
              ${item.available_date ? `${t('available_from')}: ${formatDate(item.available_date)}` : t('ready_today')}
            </span>
            ${item.price_expectation ? `
              <span class="spec-tag" style="color: #fff; border-color: rgba(255, 122, 0, 0.4);">
                ${escapeHtml(item.price_expectation)}
              </span>
            ` : ''}
          </div>

          ${item.notes ? `
            <div style="font-size: 13px; color: var(--text-muted); margin-top: 6px; line-height: 1.4;">
              ${escapeHtml(item.notes)}
            </div>
          ` : ''}

          ${driverName ? `
            <div style="font-size: 12px; color: var(--text-dim); margin-top: 4px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <span>${escapeHtml(driverName)}</span>
              ${item.owner_verified ? `
                <span class="verified-badge" title="${t('badge_verified')}">✓ ${t('badge_verified')}</span>
              ` : ''}
              ${item.owner_role ? `<span>• ${getRoleLabel(item.owner_role)}</span>` : ''}
            </div>
          ` : ''}
        </div>
      </div>

      <div class="cargo-card-footer">
        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
          <span>${t('posted_on')}: ${formatDate(item.created_at)}</span>
          ${item.owner_verified ? `
            <span class="verified-badge" title="${t('badge_verified')}">✓ ${t('badge_verified')}</span>
          ` : ''}
          ${item.owner_role ? `<span style="font-size: 11px; color: var(--text-dim);">• ${getRoleLabel(item.owner_role)}</span>` : ''}
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          ${isMyList ? `
            <button type="button" class="btn btn-sm btn-find-matches" data-type="transport" data-id="${item.id}" onclick="event.stopPropagation();" title="${t('ai_find_matches_cargo')}">
              <span class="btn-match-icon">${ICONS.radar}</span>
              <span>${t('ai_find_matches_cargo')}</span>
            </button>
            ${item.status === 'active' ? `
              <button class="btn btn-outline btn-sm btn-close-my-truck" data-id="${item.id}">
                ${t('btn_close_listing')}
              </button>
            ` : `
              <button class="btn btn-secondary btn-sm btn-reactivate-my-truck" data-id="${item.id}">
                ${t('btn_reactivate_listing')}
              </button>
            `}
            <button class="btn btn-danger btn-sm btn-delete-my-truck" data-id="${item.id}">
              ${ICONS.trash}
              <span>${t('btn_delete_truck')}</span>
            </button>
          ` : `
            <button type="button" class="btn btn-sm btn-find-matches" data-type="transport" data-id="${item.id}" onclick="event.stopPropagation();" title="${t('ai_find_matches_cargo')}">
              <span class="btn-match-icon">${ICONS.radar}</span>
              <span>${t('ai_find_matches_cargo')}</span>
            </button>
            ${(!state.user || state.user.id !== item.user_id) ? `
              <button class="btn btn-chat-action btn-sm btn-truck-chat" data-id="${item.id}" data-owner="${item.user_id}" title="${t('btn_message_owner')}">
                ${ICONS.chat}
                <span>${t('btn_message_owner')}</span>
              </button>
            ` : ''}
            ${item.phone ? `
              ${item.is_phone_unlocked || isRevealed ? `
                <a href="tel:${escapeHtml(item.phone)}" class="btn-phone" title="${t('call_contact')}">
                  ${ICONS.phone}
                  <span>${escapeHtml(item.phone)}</span>
                </a>
              ` : `
                <button class="btn btn-phone btn-unlock-phone" data-type="transport" data-id="${item.id}" title="${t('btn_reveal_phone')}">
                  ${ICONS.phone}
                  <span>${escapeHtml(item.phone)}</span>
                  <span class="unlock-badge-pill">${t('btn_reveal_phone')}</span>
                </button>
              `}
            ` : ''}
          `}
        </div>
      </div>
    </div>
  `;
}

// 4. Detail Page View (for Cargo)
function renderDetailPage() {
  if (state.loading || !state.currentListing) {
    return `
      <div style="text-align: center; padding: 40px; color: var(--text-muted);">
        ${t('btn_saving')}
      </div>
    `;
  }

  const item = state.currentListing;
  const originLoc = getLocalityLabel(item.origin_country, item.origin_locality, item.origin_custom);
  const destLoc = getLocalityLabel(item.destination_country, item.destination_locality, item.destination_custom);
  const originC = getCountryLabel(item.origin_country);
  const destC = getCountryLabel(item.destination_country);

  return `
    <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
      <a href="#/cargo" class="btn btn-outline btn-sm">
        ${t('btn_back_to_search')}
      </a>
      <div style="display: flex; gap: 8px;">
        <button type="button" class="btn btn-outline btn-sm btn-find-matches" data-type="cargo" data-id="${item.id}" title="${t('ai_find_matches_trucks')}">
          <span class="btn-match-icon">${ICONS.radar}</span>
          <span>${t('ai_find_matches_trucks')}</span>
        </button>
        ${!item.is_owner ? `
          <button class="btn btn-primary btn-sm btn-cargo-chat" data-id="${item.id}" data-owner="${item.user_id}">
            ${ICONS.chat}
            <span>${t('btn_message_owner')} / ${t('btn_offer_price')}</span>
          </button>
        ` : ''}
        ${item.is_owner ? `
          <button class="btn btn-secondary btn-sm" id="btn-edit-detail-listing">
            ${ICONS.edit}
            <span>${t('btn_edit')}</span>
          </button>
        ` : ''}
      </div>
    </div>

    <div class="detail-card">
      <div class="detail-header">
        <div>
          <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
            <span>${t('detail_route')} • ${formatDate(item.created_at)}</span>
            ${item.owner_verified ? `
              <span class="verified-badge" title="${t('badge_verified')}">✓ ${t('badge_verified')}</span>
            ` : ''}
            ${item.owner_role ? `<span>• ${getRoleLabel(item.owner_role)}</span>` : ''}
          </div>
          <div class="detail-route-title">
            <span>${originLoc}, ${originC}</span>
            <span style="color: var(--accent-primary);">${ICONS.arrowRight}</span>
            <span>${destLoc}, ${destC}</span>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 22px; font-weight: 800; color: var(--accent-secondary);">
            ${formatPrice(item)}
          </div>
          <span class="badge ${item.status === 'active' ? 'badge-active' : 'badge-closed'}" style="margin-top: 4px;">
            ${item.status === 'active' ? t('status_active') : t('status_closed')}
          </span>
        </div>
      </div>

      <!-- Specs Grid -->
      <div class="detail-grid-specs">
        <div class="spec-box">
          <div class="spec-box-label">${t('form_cargo_name')}</div>
          <div class="spec-box-value">${escapeHtml(item.cargo_name)}</div>
        </div>

        <div class="spec-box">
          <div class="spec-box-label">${t('detail_weight')}</div>
          <div class="spec-box-value">${item.weight} ${t('weight_unit')}</div>
        </div>

        <div class="spec-box">
          <div class="spec-box-label">${t('detail_volume')}</div>
          <div class="spec-box-value">${item.volume ? `${item.volume} ${t('volume_unit')}` : '—'}</div>
        </div>

        <div class="spec-box">
          <div class="spec-box-label">${t('detail_body_type')}</div>
          <div class="spec-box-value">${getBodyTypeLabel(item.body_type)}</div>
        </div>

        <div class="spec-box">
          <div class="spec-box-label">${t('detail_loading')}</div>
          <div class="spec-box-value" style="color: var(--accent-secondary);">
            ${item.loading_date_type === 'ready_now' ? t('ready_to_load') : formatDate(item.loading_date)}
          </div>
        </div>

        <div class="spec-box">
          <div class="spec-box-label">${t('detail_dimensions')}</div>
          <div class="spec-box-value">
            ${(item.dim_length || item.dim_width || item.dim_height) 
              ? `${item.dim_length || '-'} × ${item.dim_width || '-'} × ${item.dim_height || '-'} ${t('dimensions_unit')}`
              : '—'}
          </div>
        </div>
      </div>

      <!-- Description Block -->
      <div class="detail-description-block">
        <div style="font-size: 13px; font-weight: 700; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase;">
          ${t('detail_description')}
        </div>
        <div style="font-size: 14px; color: var(--text-primary); line-height: 1.6; white-space: pre-wrap;">
          ${item.cargo_description ? escapeHtml(item.cargo_description) : `<span style="color: var(--text-dim); font-style: italic;">${t('detail_no_description')}</span>`}
        </div>
      </div>

      <!-- Contact & Chat Action -->
      <div class="detail-disclaimer-box">
        <div class="disclaimer-icon">${ICONS.phone}</div>
        <div class="disclaimer-text">
          <strong style="color: #fff; display: block; margin-bottom: 4px;">${t('detail_contact_info')}</strong>
          ${item.phone ? `
            <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              ${item.is_phone_unlocked ? `
                <a href="tel:${escapeHtml(item.phone)}" class="btn btn-phone" style="font-size: 15px; font-weight: 700;">
                  ${ICONS.phone}
                  <span>${escapeHtml(item.phone)}</span>
                </a>
              ` : `
                <button class="btn btn-phone btn-unlock-phone" data-type="cargo" data-id="${item.id}" style="font-size: 14px;">
                  ${ICONS.phone}
                  <span>${escapeHtml(item.phone)}</span>
                  <span class="unlock-badge-pill" style="margin-left: 8px;">${t('btn_reveal_phone')}</span>
                </button>
              `}
            </div>
          ` : ''}
          ${!item.is_owner ? `
            <p style="margin-bottom: 10px;">${t('chat_subtitle')}</p>
            <button class="btn btn-primary btn-sm btn-cargo-chat" data-id="${item.id}" data-owner="${item.user_id}">
              ${ICONS.chat}
              <span>${t('btn_message_owner')} &amp; ${t('btn_offer_price')}</span>
            </button>
          ` : t('detail_contact_disclaimer')}
        </div>
      </div>
    </div>
  `;
}

// Messages & Chat Page View
function renderMessagesPage() {
  if (!state.user) return '';

  const filteredConvs = state.conversations.filter(c => {
    if (!state.chatFilter) return true;
    const term = state.chatFilter.toLowerCase();
    const otherName = c.other_user ? `${c.other_user.first_name || ''} ${c.other_user.last_name || ''}`.toLowerCase() : '';
    const origin = c.listing ? (c.listing.origin_city || c.listing.origin_locality || '') : '';
    const dest = c.listing ? (c.listing.destination_city || c.listing.destination_locality || '') : '';
    const title = c.listing ? (c.listing.cargo_name || c.listing.truck_model || '') : '';
    return otherName.includes(term) || origin.toLowerCase().includes(term) || dest.toLowerCase().includes(term) || title.toLowerCase().includes(term);
  });

  const activeConv = state.activeConversationData?.conversation;
  const otherUser = state.activeConversationData?.other_user;
  const listing = state.activeConversationData?.listing;
  const messages = state.activeConversationData?.messages || [];

  const isMobile = window.innerWidth <= 768;
  const hasActiveOnMobile = isMobile && state.activeConversationId;

  return `
    <div style="margin-bottom: 16px;">
      <h2 style="font-size: 22px; font-weight: 800; color: #fff;">${t('chat_title')}</h2>
      <p style="font-size: 13px; color: var(--text-muted);">${t('chat_subtitle')}</p>
    </div>

    <div class="chat-container ${state.activeConversationId ? 'has-active-chat' : ''}">
      <!-- Left Pane: Conversations List -->
      <div class="chat-sidebar ${hasActiveOnMobile ? 'mobile-hidden' : ''}">
        <div class="chat-sidebar-header">
          <input type="text" class="chat-search-input" id="chat-filter-input" 
            placeholder="${t('chat_search_placeholder')}" 
            value="${escapeHtml(state.chatFilter)}">
        </div>

        <div class="chat-conversations-list">
          ${filteredConvs.length === 0 ? `
            <div style="padding: 32px 16px; text-align: center; color: var(--text-muted); font-size: 13px;">
              <div style="margin-bottom: 8px; opacity: 0.5;">${ICONS.chat}</div>
              <div>${t('no_conversations')}</div>
              <p style="font-size: 11px; color: var(--text-dim); margin-top: 4px;">${t('no_conversations_hint')}</p>
            </div>
          ` : filteredConvs.map(conv => {
            const isActive = conv.id === state.activeConversationId;
            const partner = conv.other_user;
            const partnerName = partner ? `${partner.first_name || ''} ${partner.last_name || ''}`.trim() || 'Foydalanuvchi' : 'Foydalanuvchi';
            const initials = partner ? ((partner.first_name?.[0] || '') + (partner.last_name?.[0] || '')).toUpperCase() || 'U' : 'U';
            
            let routeText = '';
            if (conv.listing) {
              const orig = conv.listing_type === 'cargo' 
                ? getLocalityLabel(conv.listing.origin_country, conv.listing.origin_locality, conv.listing.origin_custom)
                : getLocalityLabel(conv.listing.origin_country, conv.listing.origin_city);
              const dest = conv.listing_type === 'cargo'
                ? getLocalityLabel(conv.listing.destination_country, conv.listing.destination_locality, conv.listing.destination_custom)
                : (conv.listing.destination_country ? getLocalityLabel(conv.listing.destination_country, conv.listing.destination_city) : t('any_direction'));
              routeText = `${orig} → ${dest}`;
            }

            const snippet = conv.last_message || (conv.listing_type === 'cargo' ? conv.listing?.cargo_name : conv.listing?.truck_model) || '...';
            const timeStr = conv.last_message_at ? formatChatTime(conv.last_message_at) : formatDate(conv.created_at);

            return `
              <div class="chat-conv-item ${isActive ? 'active' : ''}" data-conv-id="${conv.id}">
                <div class="chat-conv-avatar">${initials}</div>
                <div class="chat-conv-info">
                  <div class="chat-conv-header-row">
                    <span class="chat-conv-name">${escapeHtml(partnerName)}</span>
                    <span class="chat-conv-time">${timeStr}</span>
                  </div>
                  ${routeText ? `
                    <div class="chat-conv-route-badge">📍 ${escapeHtml(routeText)}</div>
                  ` : ''}
                  <div class="chat-conv-snippet-row">
                    <span class="chat-conv-snippet">${escapeHtml(snippet)}</span>
                    ${conv.unread_count > 0 ? `<div class="chat-conv-unread-dot" title="${conv.unread_count} ${t('unread_badge')}"></div>` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Right Pane: Active Chat Window -->
      <div class="chat-main ${!hasActiveOnMobile && isMobile ? 'mobile-hidden' : ''}">
        ${!state.activeConversationId || !state.activeConversationData ? `
          <div class="chat-main-empty">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #1a1a1a; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; color: var(--accent-primary);">
              ${ICONS.chat}
            </div>
            <h3 style="font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 6px;">${t('select_chat_placeholder')}</h3>
            <p style="font-size: 13px; max-width: 320px; line-height: 1.5;">${t('select_chat_hint')}</p>
          </div>
        ` : `
          <!-- Chat Header -->
          <div class="chat-main-header">
            <div class="chat-partner-box">
              <button class="btn btn-outline btn-sm chat-back-btn" id="btn-chat-mobile-back" title="${t('btn_back_to_chats')}">
                ← ${t('btn_back_to_chats')}
              </button>
              <div class="chat-partner-avatar">
                ${otherUser ? (((otherUser.first_name?.[0] || '') + (otherUser.last_name?.[0] || '')).toUpperCase() || 'U') : 'U'}
              </div>
              <div class="chat-partner-details">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span class="chat-partner-name">
                    ${otherUser ? `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim() || 'Foydalanuvchi' : 'Foydalanuvchi'}
                  </span>
                  ${otherUser?.is_verified ? `
                    <span class="verified-badge" title="${t('badge_verified')}">✓ ${t('badge_verified')}</span>
                  ` : ''}
                </div>
                <span class="chat-partner-role">
                  ${otherUser?.role ? getRoleLabel(otherUser.role) : ''}
                </span>
              </div>
            </div>

            <div class="chat-header-actions">
              ${otherUser?.phone ? `
                <a href="tel:${escapeHtml(otherUser.phone)}" class="btn-phone" title="Telefon qilish">
                  ${ICONS.phone}
                  <span>${escapeHtml(otherUser.phone)}</span>
                </a>
              ` : ''}
            </div>
          </div>

          <!-- Linked Listing Context Banner -->
          ${listing ? `
            <div class="chat-listing-banner" onclick="window.location.hash = '${activeConv.listing_type === 'cargo' ? `#/cargo/${listing.id}` : '#/trucks'}'">
              <div class="chat-listing-banner-left">
                <span class="chat-listing-tag">
                  ${activeConv.listing_type === 'cargo' ? `📦 ${t('chat_context_cargo')}` : `🚛 ${t('chat_context_truck')}`}
                </span>
                <span class="chat-listing-route">
                  ${activeConv.listing_type === 'cargo'
                    ? `${getLocalityLabel(listing.origin_country, listing.origin_locality, listing.origin_custom)} → ${getLocalityLabel(listing.destination_country, listing.destination_locality, listing.destination_custom)}`
                    : `${getLocalityLabel(listing.origin_country, listing.origin_city)} → ${listing.destination_country ? getLocalityLabel(listing.destination_country, listing.destination_city) : t('any_direction')}`
                  }
                </span>
                <span class="chat-listing-specs desktop-only">
                  • ${activeConv.listing_type === 'cargo' ? `${escapeHtml(listing.cargo_name)} (${listing.weight} ${t('weight_unit')})` : `${escapeHtml(listing.truck_model || '')} (${listing.max_weight} ${t('weight_unit')})`}
                </span>
              </div>
              <div class="chat-listing-banner-right">
                <span class="chat-listing-price-text">${activeConv.listing_type === 'cargo' ? formatPrice(listing) : (listing.price_expectation || '')}</span>
                <span class="chat-listing-arrow">➔</span>
              </div>
            </div>
          ` : ''}

          <!-- Messages Scroll Area -->
          <div class="chat-messages-area" id="chat-messages-scroll">
            ${messages.length === 0 ? `
              <div style="text-align: center; color: var(--text-dim); margin: auto; font-size: 13px;">
                ${t('no_conversations_hint')}
              </div>
            ` : messages.map(msg => {
              const isSentByMe = msg.sender_id === state.user?.id;
              return `
                <div class="chat-bubble-row ${isSentByMe ? 'sent' : 'received'}">
                  ${msg.offered_price ? `
                    <div class="chat-offer-card">
                      <div class="chat-offer-badge">
                        <span>💰</span>
                        <span>${t('offered_price_tag')}</span>
                      </div>
                      <div class="chat-offer-price">${Number(msg.offered_price).toLocaleString()} UZS</div>
                    </div>
                  ` : ''}
                  <div class="chat-bubble">
                    ${escapeHtml(msg.content)}
                  </div>
                  ${!isSentByMe ? `
                    <div class="chat-translation-action">
                      ${state.translatedMessages && state.translatedMessages[msg.id] ? `
                        <div class="translated-msg-box">
                          <span class="translated-lang-badge">${escapeHtml((state.translatedMessages[msg.id].target_lang || 'UZ').toUpperCase())}</span>
                          <span>${escapeHtml(state.translatedMessages[msg.id].text)}</span>
                        </div>
                      ` : `
                        <button type="button" class="btn-translate-msg" data-msg-id="${msg.id}" data-text="${escapeHtml(msg.content)}" title="${t('btn_translate_msg')}">
                          <span class="btn-translate-icon">${ICONS.translate}</span>
                          <span>${t('btn_translate_msg')}</span>
                        </button>
                      `}
                    </div>
                  ` : ''}
                  <div class="chat-msg-time">
                    ${formatChatTime(msg.created_at)} ${isSentByMe ? (msg.is_read ? '✓✓' : '✓') : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Quick Logistics Negotiation Templates Bar -->
          <div class="chat-templates-bar">
            <span class="chat-templates-label">⚡ ${t('quick_negotiate_title')}</span>
            <button type="button" class="chat-template-chip" data-template="${t('template_cargo_available')}">
              📦 ${t('template_cargo_available')}
            </button>
            <button type="button" class="chat-template-chip" data-template="${t('template_negotiate_rate')}">
              🤝 ${t('template_negotiate_rate')}
            </button>
            <button type="button" class="chat-template-chip" data-template="${t('template_truck_ready')}">
              🚛 ${t('template_truck_ready')}
            </button>
            <button type="button" class="chat-template-chip" data-template="${t('template_docs_ready')}">
              📄 ${t('template_docs_ready')}
            </button>
          </div>

          <!-- Composer Area -->
          <form id="form-chat-send" class="chat-composer-area">
            ${state.chatOfferInputVisible ? `
              <div class="chat-offer-bar">
                <div class="chat-offer-bar-label">💰 ${t('offer_price_modal_title')}</div>
                <div class="chat-offer-bar-row">
                  <div class="chat-offer-input-wrapper">
                    <input type="number" id="chat-offer-price-input" 
                      placeholder="${t('offer_price_placeholder')}" 
                      value="${state.chatOfferAmount || ''}" 
                      min="1000" step="1000">
                    <span class="chat-offer-curr">UZS</span>
                  </div>
                  <button type="button" class="btn btn-primary btn-sm" id="btn-send-offer-direct">
                    ${t('btn_send')}
                  </button>
                  <button type="button" class="btn btn-outline btn-sm" id="btn-cancel-offer" title="Bekor qilish">
                    ✕
                  </button>
                </div>
              </div>
            ` : ''}

            <div class="chat-composer-inputs">
              <button type="button" class="btn btn-outline btn-sm btn-offer-pill ${state.chatOfferInputVisible ? 'active' : ''}" id="btn-toggle-offer" title="${t('btn_offer_price')}">
                💰 <span>${t('btn_offer_price')}</span>
              </button>
              
              <input type="text" class="chat-text-input" id="chat-message-input" 
                placeholder="${t('type_message_placeholder')}" 
                value="${escapeHtml(state.chatMessageDraft)}" 
                autocomplete="off">

              <button type="submit" class="btn btn-primary btn-send-msg" id="btn-send-message" ${state.chatSending ? 'disabled' : ''}>
                ${state.chatSending ? '...' : `${ICONS.send} <span class="desktop-only">${t('btn_send')}</span>`}
              </button>
            </div>
          </form>
        `}
      </div>
    </div>
  `;
}

// AI Smart Parser Component & Form Auto-fill Logic
function renderAiSmartFillBox(type = 'cargo') {
  const isCargo = type === 'cargo';
  const textValue = isCargo ? (state.aiCargoText || '') : (state.aiTruckText || '');
  const isLoading = isCargo ? state.aiCargoLoading : state.aiTruckLoading;
  const textareaId = isCargo ? 'pub-ai-text' : 'pt-ai-text';
  const btnId = isCargo ? 'btn-pub-ai-fill' : 'btn-pt-ai-fill';
  const placeholder = isCargo ? t('ai_smart_fill_placeholder_cargo') : t('ai_smart_fill_placeholder_truck');

  return `
    <div class="ai-smart-fill-card">
      <div class="ai-smart-fill-header">
        <div class="ai-smart-fill-title-group">
          <div class="ai-smart-fill-title">
            <span class="ai-title-icon">${ICONS.aiSparkle}</span>
            <span>${t('ai_smart_fill_title')}</span>
          </div>
          <span class="ai-smart-fill-badge">${ICONS.bolt} <span>${t('ai_badge_fast') || 'AI Smart'}</span></span>
        </div>
      </div>
      <div class="ai-smart-fill-subtitle">
        ${t('ai_smart_fill_subtitle')}
      </div>
      <textarea class="ai-smart-fill-textarea" id="${textareaId}" rows="2" 
        placeholder="${placeholder}">${escapeHtml(textValue)}</textarea>
      <div class="ai-smart-fill-actions">
        <button type="button" class="btn-ai-fill ${isLoading ? 'loading' : ''}" id="${btnId}" ${isLoading ? 'disabled' : ''}>
          <span class="btn-icon">${isLoading ? '<span class="spinner-mini"></span>' : ICONS.aiSparkle}</span>
          <span>${isLoading ? t('ai_btn_filling') : t('ai_btn_fill')}</span>
        </button>
      </div>
    </div>
  `;
}

async function handleAiSmartFill(type = 'cargo') {
  const isCargo = type === 'cargo';
  const textareaId = isCargo ? 'pub-ai-text' : 'pt-ai-text';
  const textEl = document.getElementById(textareaId);
  const text = textEl ? textEl.value.trim() : (isCargo ? state.aiCargoText : state.aiTruckText);

  if (!text || text.length < 5) {
    showToast(t('ai_err_empty'), 'warning');
    if (textEl) textEl.focus();
    return;
  }

  if (isCargo) {
    state.aiCargoLoading = true;
    state.aiCargoText = text;
  } else {
    state.aiTruckLoading = true;
    state.aiTruckText = text;
  }
  render();

  try {
    const res = await api('/api/ai/parse-listing', {
      method: 'POST',
      body: JSON.stringify({ text, type })
    });

    const data = res.data;
    if (!data) throw new Error(t('ai_err_not_logistics'));

    if (isCargo) {
      // 1. Match Origin
      if (data.origin_country) {
        state.publishDraft.origin_country = data.origin_country;
      }
      const originCountryObj = state.metadata.locations.find(c => c.code === state.publishDraft.origin_country);
      const originLocMatch = originCountryObj?.localities.find(l => l.id === data.origin_city);
      if (originLocMatch) {
        state.publishDraft.origin_locality = originLocMatch.id;
        state.publishDraft.origin_custom = '';
      } else if (data.origin_city) {
        state.publishDraft.origin_locality = '__custom__';
        state.publishDraft.origin_custom = data.origin_city;
      }

      // 2. Match Destination
      if (data.destination_country) {
        state.publishDraft.destination_country = data.destination_country;
      }
      const destCountryObj = state.metadata.locations.find(c => c.code === state.publishDraft.destination_country);
      const destLocMatch = destCountryObj?.localities.find(l => l.id === data.destination_city);
      if (destLocMatch) {
        state.publishDraft.destination_locality = destLocMatch.id;
        state.publishDraft.destination_custom = '';
      } else if (data.destination_city) {
        state.publishDraft.destination_locality = '__custom__';
        state.publishDraft.destination_custom = data.destination_city;
      }

      // 3. Cargo Details
      if (data.cargo_name) state.publishDraft.cargo_name = data.cargo_name;
      if (data.body_type) state.publishDraft.body_type = data.body_type;
      if (data.weight) state.publishDraft.weight = data.weight;
      if (data.volume) state.publishDraft.volume = data.volume;
      if (data.price_type) state.publishDraft.price_type = data.price_type;
      if (data.price_amount) state.publishDraft.price_amount = data.price_amount;
      if (data.price_currency) state.publishDraft.price_currency = data.price_currency;
      if (data.notes) state.publishDraft.cargo_description = data.notes;

      state.aiCargoLoading = false;
      render();

      // Trigger orange visual glow feedback on form inputs
      setTimeout(() => {
        const form = document.getElementById('form-publish-cargo');
        if (form) {
          form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
            el.classList.add('ai-autofilled-glow');
            setTimeout(() => el.classList.remove('ai-autofilled-glow'), 2300);
          });
        }
      }, 50);

      showToast(t('ai_fill_success'), 'success');
    } else {
      // Transport
      // 1. Origin
      if (data.origin_country) {
        state.publishTruckDraft.origin_country = data.origin_country;
      }
      const originCountryObj = state.metadata.locations.find(c => c.code === state.publishTruckDraft.origin_country);
      const originLocMatch = originCountryObj?.localities.find(l => l.id === data.origin_city);
      if (originLocMatch) {
        state.publishTruckDraft.origin_city = originLocMatch.id;
        state.publishTruckDraft.origin_custom = '';
      } else if (data.origin_city) {
        state.publishTruckDraft.origin_city = '__custom__';
        state.publishTruckDraft.origin_custom = data.origin_city;
      }

      // 2. Destination (optional for truck)
      if (data.destination_country) {
        state.publishTruckDraft.destination_country = data.destination_country;
        const destCountryObj = state.metadata.locations.find(c => c.code === state.publishTruckDraft.destination_country);
        const destLocMatch = destCountryObj?.localities.find(l => l.id === data.destination_city);
        if (destLocMatch) {
          state.publishTruckDraft.destination_city = destLocMatch.id;
          state.publishTruckDraft.destination_custom = '';
        } else if (data.destination_city) {
          state.publishTruckDraft.destination_city = '__custom__';
          state.publishTruckDraft.destination_custom = data.destination_city;
        }
      }

      // 3. Truck Details
      if (data.truck_model) state.publishTruckDraft.truck_model = data.truck_model;
      if (data.body_type) state.publishTruckDraft.body_type = data.body_type;
      if (data.max_weight) state.publishTruckDraft.max_weight = data.max_weight;
      if (data.volume) state.publishTruckDraft.volume = data.volume;
      if (data.available_date) state.publishTruckDraft.available_date = data.available_date;
      if (data.price_expectation) state.publishTruckDraft.price_expectation = data.price_expectation;
      if (data.phone) state.publishTruckDraft.phone = data.phone;
      if (data.notes) state.publishTruckDraft.notes = data.notes;

      state.aiTruckLoading = false;
      render();

      setTimeout(() => {
        const form = document.getElementById('form-publish-truck');
        if (form) {
          form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
            el.classList.add('ai-autofilled-glow');
            setTimeout(() => el.classList.remove('ai-autofilled-glow'), 2300);
          });
        }
      }, 50);

      showToast(t('ai_fill_success'), 'success');
    }
  } catch (err) {
    if (isCargo) state.aiCargoLoading = false;
    else state.aiTruckLoading = false;
    render();

    if (err.message && (err.message.includes('not_logistics') || err.error === 'not_logistics')) {
      showToast(t('ai_err_not_logistics'), 'error');
    } else if (err.error === 'rate_limit_exceeded') {
      showToast(t('ai_err_rate_limit'), 'error');
    } else {
      showToast(err.message || t('ai_err_not_logistics'), 'error');
    }
  }
}

// Stage 2: AI Smart Matching Modal Launcher
async function openAiMatchModal(listingType, listingId) {
  if (!state.user) {
    navigate('#/auth');
    showToast(t('login_required_chat') || 'Iltimos, avval tizimga kiring', 'info');
    return;
  }

  state.modal = {
    type: 'ai_match',
    listingType,
    listingId,
    loading: true,
    matches: [],
    target: null,
    error: null
  };
  renderModal();

  try {
    const res = await api('/api/ai/match', {
      method: 'POST',
      body: JSON.stringify({
        listing_type: listingType,
        listing_id: listingId,
        lang: getLanguage()
      })
    });

    if (state.modal && state.modal.type === 'ai_match' && state.modal.listingId === listingId) {
      state.modal.loading = false;
      state.modal.matches = res.matches || [];
      state.modal.target = res.target || null;
      renderModal();
    }
  } catch (err) {
    if (state.modal && state.modal.type === 'ai_match') {
      state.modal.loading = false;
      state.modal.error = err.message || t('err_general');
      renderModal();
    }
  }
}

// 5. Publish Cargo Page View
function renderPublishPage() {
  if (!state.user) return '';

  const d = state.publishDraft;
  const originCountryObj = state.metadata.locations.find(c => c.code === d.origin_country);
  const destCountryObj = state.metadata.locations.find(c => c.code === d.destination_country);

  return `
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 22px; font-weight: 800; color: #fff;">${t('publish_title')}</h2>
        <p style="font-size: 13px; color: var(--text-muted);">${t('publish_subtitle')}</p>
      </div>

      ${!state.user.profile_completed ? `
        <div class="google-limitation-banner" style="background-color: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3);">
          <div>${ICONS.shieldAlert}</div>
          <div>
            <strong style="color: var(--danger-text);">${t('profile_status_incomplete')}</strong>
            <p>${t('profile_required_notice')}</p>
            <button class="btn btn-primary btn-sm" id="btn-open-complete-profile" style="margin-top: 8px;">
              ${t('btn_complete_profile_now')}
            </button>
          </div>
        </div>
      ` : ''}

      <!-- AI Smart Fill (Cargo) -->
      ${renderAiSmartFillBox('cargo')}

      <form id="form-publish-cargo" class="form-card">
        <!-- Section 1: Origin -->
        <div>
          <div class="form-section-title">${t('form_origin_section')}</div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">${t('filter_country')} *</label>
              <select class="form-select" id="pub-origin-country" required>
                ${state.metadata.locations.map(c => `
                  <option value="${c.code}" ${c.code === d.origin_country ? 'selected' : ''}>
                    ${getLocalizedName(c)}
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">${t('filter_locality')} *</label>
              <select class="form-select" id="pub-origin-locality" required>
                ${originCountryObj ? originCountryObj.localities.map(l => `
                  <option value="${l.id}" ${l.id === d.origin_locality ? 'selected' : ''}>
                    ${getLocalizedName(l)}
                  </option>
                `).join('') : ''}
                <option value="__custom__" ${d.origin_locality === '__custom__' ? 'selected' : ''}>
                  ✦ ${t('filter_custom_locality_label')}
                </option>
              </select>
            </div>
          </div>

          ${d.origin_locality === '__custom__' ? `
            <div class="form-group" style="margin-top: 10px;">
              <label class="form-label">${t('filter_manual_locality_placeholder')} *</label>
              <input type="text" class="form-input" id="pub-origin-custom" 
                placeholder="${t('filter_manual_locality_placeholder')}" 
                value="${escapeHtml(d.origin_custom || '')}" required>
            </div>
          ` : ''}
        </div>

        <!-- Section 2: Destination -->
        <div>
          <div class="form-section-title">${t('form_destination_section')}</div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">${t('filter_country')} *</label>
              <select class="form-select" id="pub-dest-country" required>
                ${state.metadata.locations.map(c => `
                  <option value="${c.code}" ${c.code === d.destination_country ? 'selected' : ''}>
                    ${getLocalizedName(c)}
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">${t('filter_locality')} *</label>
              <select class="form-select" id="pub-dest-locality" required>
                ${destCountryObj ? destCountryObj.localities.map(l => `
                  <option value="${l.id}" ${l.id === d.destination_locality ? 'selected' : ''}>
                    ${getLocalizedName(l)}
                  </option>
                `).join('') : ''}
                <option value="__custom__" ${d.destination_locality === '__custom__' ? 'selected' : ''}>
                  ✦ ${t('filter_custom_locality_label')}
                </option>
              </select>
            </div>
          </div>

          ${d.destination_locality === '__custom__' ? `
            <div class="form-group" style="margin-top: 10px;">
              <label class="form-label">${t('filter_manual_locality_placeholder')} *</label>
              <input type="text" class="form-input" id="pub-dest-custom" 
                placeholder="${t('filter_manual_locality_placeholder')}" 
                value="${escapeHtml(d.destination_custom || '')}" required>
            </div>
          ` : ''}
        </div>

        <!-- Section 3: Cargo Details -->
        <div>
          <div class="form-section-title">${t('form_cargo_section')}</div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">${t('form_cargo_name')} *</label>
              <input type="text" class="form-input" id="pub-cargo-name" 
                placeholder="${t('form_cargo_name_placeholder')}" 
                value="${escapeHtml(d.cargo_name)}" required>
            </div>

            <div class="form-group">
              <label class="form-label">${t('form_body_type')} *</label>
              <select class="form-select" id="pub-body-type" required>
                ${state.metadata.body_types.map(b => `
                  <option value="${b.id}" ${b.id === d.body_type ? 'selected' : ''}>
                    ${getLocalizedName(b)}
                  </option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="form-row-2" style="margin-top: 12px;">
            <div class="form-group">
              <label class="form-label">${t('form_weight')} *</label>
              <input type="number" step="0.1" min="0.1" max="500" class="form-input" id="pub-weight" 
                placeholder="${t('form_weight_placeholder')}" 
                value="${d.weight}" required>
            </div>

            <div class="form-group">
              <label class="form-label">${t('form_volume')}</label>
              <input type="number" step="0.1" min="0" class="form-input" id="pub-volume" 
                placeholder="${t('form_volume_placeholder')}" 
                value="${d.volume}">
            </div>
          </div>

          <div style="margin-top: 12px;">
            <label class="form-label">${t('form_dimensions')}</label>
            <div class="form-row-3">
              <input type="number" step="0.1" min="0" class="form-input" id="pub-dim-length" 
                placeholder="${t('form_dim_length')}" value="${d.dim_length}">
              <input type="number" step="0.1" min="0" class="form-input" id="pub-dim-width" 
                placeholder="${t('form_dim_width')}" value="${d.dim_width}">
              <input type="number" step="0.1" min="0" class="form-input" id="pub-dim-height" 
                placeholder="${t('form_dim_height')}" value="${d.dim_height}">
            </div>
          </div>

          <div class="form-group" style="margin-top: 12px;">
            <label class="form-label">${t('form_description')}</label>
            <textarea class="form-textarea" id="pub-description" rows="3" 
              placeholder="${t('form_description_placeholder')}">${escapeHtml(d.cargo_description)}</textarea>
          </div>
        </div>

        <!-- Section 4: Schedule and Price -->
        <div>
          <div class="form-section-title">${t('form_terms_section')}</div>
          
          <div class="form-group">
            <label class="form-label">${t('form_loading_type')} *</label>
            <div class="form-radio-group">
              <label class="radio-card">
                <input type="radio" name="loading_date_type" value="ready_now" 
                  ${d.loading_date_type === 'ready_now' ? 'checked' : ''}>
                <span>${t('form_loading_ready_now')}</span>
              </label>
              <label class="radio-card">
                <input type="radio" name="loading_date_type" value="specific" 
                  ${d.loading_date_type === 'specific' ? 'checked' : ''}>
                <span>${t('form_loading_specific_date')}</span>
              </label>
            </div>
            ${d.loading_date_type === 'specific' ? `
              <div style="margin-top: 8px; max-width: 260px;">
                <input type="date" class="form-input" id="pub-loading-date" 
                  value="${d.loading_date}" required>
              </div>
            ` : ''}
          </div>

          <div class="form-group" style="margin-top: 14px;">
            <label class="form-label">${t('form_price_type')} *</label>
            <div class="form-radio-group">
              <label class="radio-card">
                <input type="radio" name="price_type" value="negotiable" 
                  ${d.price_type === 'negotiable' ? 'checked' : ''}>
                <span>${t('form_price_negotiable')}</span>
              </label>
              <label class="radio-card">
                <input type="radio" name="price_type" value="fixed" 
                  ${d.price_type === 'fixed' ? 'checked' : ''}>
                <span>${t('form_price_fixed')}</span>
              </label>
            </div>
            ${d.price_type === 'fixed' ? `
              <div class="form-row-2" style="margin-top: 8px;">
                <input type="number" step="1" min="1" class="form-input" id="pub-price-amount" 
                  placeholder="${t('form_price_amount')}" value="${d.price_amount}" required>
                <select class="form-select" id="pub-price-currency">
                  <option value="UZS" ${d.price_currency === 'UZS' ? 'selected' : ''}>UZS (So‘m)</option>
                  <option value="USD" ${d.price_currency === 'USD' ? 'selected' : ''}>USD ($)</option>
                  <option value="EUR" ${d.price_currency === 'EUR' ? 'selected' : ''}>EUR (€)</option>
                  <option value="RUB" ${d.price_currency === 'RUB' ? 'selected' : ''}>RUB (₽)</option>
                </select>
              </div>
            ` : ''}
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px; border-top: 1px solid var(--surface-border-subtle); padding-top: 16px;">
          <button type="submit" class="btn btn-primary" id="btn-submit-publish" 
            ${state.publishFormSubmitting || !state.user.profile_completed ? 'disabled' : ''}>
            ${state.publishFormSubmitting ? t('btn_saving') : t('btn_publish_submit')}
          </button>
        </div>
      </form>
    </div>
  `;
}

// 6. Add Transport View
function renderPublishTruckPage() {
  if (!state.user) return '';

  const d = state.publishTruckDraft;
  const originCountryObj = state.metadata.locations.find(c => c.code === d.origin_country);
  const destCountryObj = d.destination_country ? state.metadata.locations.find(c => c.code === d.destination_country) : null;

  return `
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 22px; font-weight: 800; color: #fff;">${t('publish_truck_title')}</h2>
        <p style="font-size: 13px; color: var(--text-muted);">${t('publish_truck_subtitle')}</p>
      </div>

      ${!state.user.profile_completed ? `
        <div class="google-limitation-banner" style="background-color: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3);">
          <div>${ICONS.shieldAlert}</div>
          <div>
            <strong style="color: var(--danger-text);">${t('profile_status_incomplete')}</strong>
            <p>${t('profile_required_notice')}</p>
            <button class="btn btn-primary btn-sm" id="btn-open-complete-profile" style="margin-top: 8px;">
              ${t('btn_complete_profile_now')}
            </button>
          </div>
        </div>
      ` : ''}

      <!-- AI Smart Fill (Transport) -->
      ${renderAiSmartFillBox('transport')}

      <form id="form-publish-truck" class="form-card">
        <!-- Section 1: Current Location -->
        <div>
          <div class="form-section-title">${t('form_truck_origin_section')}</div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">${t('filter_country')} *</label>
              <select class="form-select" id="pt-origin-country" required>
                ${state.metadata.locations.map(c => `
                  <option value="${c.code}" ${c.code === d.origin_country ? 'selected' : ''}>
                    ${getLocalizedName(c)}
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">${t('filter_locality')} *</label>
              <select class="form-select" id="pt-origin-city" required>
                ${originCountryObj ? originCountryObj.localities.map(l => `
                  <option value="${l.id}" ${l.id === d.origin_city ? 'selected' : ''}>
                    ${getLocalizedName(l)}
                  </option>
                `).join('') : ''}
                <option value="__custom__" ${d.origin_city === '__custom__' ? 'selected' : ''}>
                  ✦ ${t('filter_custom_locality_label')}
                </option>
              </select>
            </div>
          </div>

          ${d.origin_city === '__custom__' ? `
            <div class="form-group" style="margin-top: 10px;">
              <label class="form-label">${t('filter_manual_locality_placeholder')} *</label>
              <input type="text" class="form-input" id="pt-origin-custom" 
                placeholder="${t('filter_manual_locality_placeholder')}" 
                value="${escapeHtml(d.origin_custom || '')}" required>
            </div>
          ` : ''}
        </div>

        <!-- Section 2: Preferred Destination (Optional) -->
        <div>
          <div class="form-section-title">${t('form_truck_dest_section')}</div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">${t('filter_country')} (${t('any_direction')})</label>
              <select class="form-select" id="pt-dest-country">
                <option value="">${t('filter_any_destination')}</option>
                ${state.metadata.locations.map(c => `
                  <option value="${c.code}" ${c.code === d.destination_country ? 'selected' : ''}>
                    ${getLocalizedName(c)}
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">${t('filter_locality')}</label>
              <select class="form-select" id="pt-dest-city" ${!d.destination_country ? 'disabled' : ''}>
                <option value="">${d.destination_country ? t('filter_locality') + ' (Barchasi)' : t('select_country_first')}</option>
                ${destCountryObj ? destCountryObj.localities.map(l => `
                  <option value="${l.id}" ${l.id === d.destination_city ? 'selected' : ''}>
                    ${getLocalizedName(l)}
                  </option>
                `).join('') : ''}
                ${d.destination_country ? `
                  <option value="__custom__" ${d.destination_city === '__custom__' ? 'selected' : ''}>
                    ✦ ${t('filter_custom_locality_label')}
                  </option>
                ` : ''}
              </select>
            </div>
          </div>

          ${d.destination_city === '__custom__' ? `
            <div class="form-group" style="margin-top: 10px;">
              <label class="form-label">${t('filter_manual_locality_placeholder')}</label>
              <input type="text" class="form-input" id="pt-dest-custom" 
                placeholder="${t('filter_manual_locality_placeholder')}" 
                value="${escapeHtml(d.destination_custom || '')}">
            </div>
          ` : ''}
        </div>

        <!-- Section 3: Truck Details -->
        <div>
          <div class="form-section-title">${t('form_truck_specs_section')}</div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">${t('form_truck_model')}</label>
              <input type="text" class="form-input" id="pt-truck-model" 
                placeholder="${t('form_truck_model_placeholder')}" 
                value="${escapeHtml(d.truck_model || '')}">
            </div>

            <div class="form-group">
              <label class="form-label">${t('filter_body_type')} *</label>
              <select class="form-select" id="pt-body-type" required>
                ${state.metadata.body_types.map(b => `
                  <option value="${b.id}" ${b.id === d.body_type ? 'selected' : ''}>
                    ${getLocalizedName(b)}
                  </option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="form-row-2" style="margin-top: 12px;">
            <div class="form-group">
              <label class="form-label">${t('form_max_weight')} *</label>
              <input type="number" step="0.1" min="0.1" max="500" class="form-input" id="pt-max-weight" 
                placeholder="${t('form_max_weight_placeholder')}" 
                value="${d.max_weight}" required>
            </div>

            <div class="form-group">
              <label class="form-label">${t('truck_volume')} (m³)</label>
              <input type="number" step="0.1" min="0" class="form-input" id="pt-volume" 
                placeholder="Masalan: 86" 
                value="${d.volume || ''}">
            </div>
          </div>

          <div class="form-row-2" style="margin-top: 12px;">
            <div class="form-group">
              <label class="form-label">${t('form_available_date')}</label>
              <input type="date" class="form-input" id="pt-available-date" 
                value="${d.available_date || ''}">
            </div>

            <div class="form-group">
              <label class="form-label">${t('form_price_expectation')}</label>
              <input type="text" class="form-input" id="pt-price-expectation" 
                placeholder="${t('form_price_expectation_placeholder')}" 
                value="${escapeHtml(d.price_expectation || '')}">
            </div>
          </div>

          <div class="form-group" style="margin-top: 12px;">
            <label class="form-label">${t('form_contact_phone')} *</label>
            <input type="tel" class="form-input" id="pt-phone" 
              placeholder="+998 90 123 45 67" 
              value="${escapeHtml(d.phone || (state.user ? state.user.phone : '+998'))}" required>
          </div>

          <div class="form-group" style="margin-top: 12px;">
            <label class="form-label">${t('form_notes')}</label>
            <textarea class="form-textarea" id="pt-notes" rows="3" 
              placeholder="${t('form_notes_placeholder')}">${escapeHtml(d.notes || '')}</textarea>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px; border-top: 1px solid var(--surface-border-subtle); padding-top: 16px;">
          <button type="submit" class="btn btn-primary" id="btn-submit-publish-truck" 
            ${state.publishTruckFormSubmitting || !state.user.profile_completed ? 'disabled' : ''}>
            ${state.publishTruckFormSubmitting ? t('btn_saving') : t('btn_publish_truck_submit')}
          </button>
        </div>
      </form>
    </div>
  `;
}

// 7. My Listings Page View (with Cargo & Trucks Tabs)
function renderMyListingsPage() {
  if (!state.user) return '';

  return `
    <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
      <div>
        <h2 style="font-size: 22px; font-weight: 800; color: #fff;">${t('my_listings_title')}</h2>
        <p style="font-size: 13px; color: var(--text-muted);">${t('my_listings_subtitle')}</p>
      </div>
      <div style="display: flex; gap: 8px;">
        <a href="#/publish" class="btn btn-outline btn-sm">
          ${ICONS.add}
          <span>${t('nav_publish')}</span>
        </a>
        <a href="#/publish-truck" class="btn btn-primary btn-sm">
          ${ICONS.addTruck}
          <span>${t('nav_publish_truck')}</span>
        </a>
      </div>
    </div>

    <!-- Segmented Tabs for My Listings -->
    <div style="display: flex; justify-content: flex-start; margin-bottom: 16px;">
      <div class="segmented-tabs">
        <button class="tab-btn ${state.myListingsTab === 'cargo' ? 'active' : ''}" id="my-toggle-cargo">
          ${ICONS.truck}
          <span>${t('tab_my_cargo')} (${state.myListings.length})</span>
        </button>
        <button class="tab-btn ${state.myListingsTab === 'trucks' ? 'active' : ''}" id="my-toggle-trucks">
          ${ICONS.steering}
          <span>${t('tab_my_trucks')} (${state.myTransports.length})</span>
        </button>
      </div>
    </div>

    ${state.loading ? `
      <div style="text-align: center; padding: 40px; color: var(--text-muted);">
        ${t('btn_saving')}
      </div>
    ` : state.myListingsTab === 'cargo' ? (
      state.myListings.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">${ICONS.list}</div>
          <div class="empty-state-title">${t('no_my_listings')}</div>
          <a href="#/publish" class="btn btn-primary" style="margin-top: 8px;">
            ${ICONS.add}
            <span>${t('btn_add_first_cargo')}</span>
          </a>
        </div>
      ` : `
        <div class="listings-grid">
          ${state.myListings.map(item => renderMyListingCard(item)).join('')}
        </div>
      `
    ) : (
      state.myTransports.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">${ICONS.steering}</div>
          <div class="empty-state-title">${t('no_my_trucks')}</div>
          <a href="#/publish-truck" class="btn btn-primary" style="margin-top: 8px;">
            ${ICONS.addTruck}
            <span>${t('btn_add_first_truck')}</span>
          </a>
        </div>
      ` : `
        <div class="listings-grid">
          ${state.myTransports.map(item => renderTruckCard(item, true)).join('')}
        </div>
      `
    )}
  `;
}

function renderMyListingCard(item) {
  const originLoc = getLocalityLabel(item.origin_country, item.origin_locality, item.origin_custom);
  const destLoc = getLocalityLabel(item.destination_country, item.destination_locality, item.destination_custom);
  const originC = getCountryLabel(item.origin_country);
  const destC = getCountryLabel(item.destination_country);

  return `
    <div class="cargo-card" style="cursor: default;">
      <div class="cargo-card-top">
        <div class="cargo-route">
          <span>${originLoc} (${originC})</span>
          <span class="route-arrow">${ICONS.arrowRight}</span>
          <span>${destLoc} (${destC})</span>
        </div>
        <div class="cargo-price-badge">
          ${formatPrice(item)}
        </div>
      </div>

      <div class="cargo-card-body">
        <div class="cargo-details-left">
          <div class="cargo-name-text">${escapeHtml(item.cargo_name)}</div>
          <div class="cargo-specs-tags">
            <span class="spec-tag"><strong>${item.weight}</strong> ${t('weight_unit')}</span>
            ${item.volume ? `<span class="spec-tag"><strong>${item.volume}</strong> ${t('volume_unit')}</span>` : ''}
            <span class="spec-tag">${getBodyTypeLabel(item.body_type)}</span>
            <span class="spec-tag" style="color: var(--accent-secondary);">
              ${item.loading_date_type === 'ready_now' ? t('ready_to_load') : `${t('loading_date_prefix')} ${formatDate(item.loading_date)}`}
            </span>
          </div>
        </div>
      </div>

      <div class="cargo-card-footer">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge ${item.status === 'active' ? 'badge-active' : 'badge-closed'}">
            ${item.status === 'active' ? t('status_active') : t('status_closed')}
          </span>
          <span>${t('posted_on')}: ${formatDate(item.created_at)}</span>
        </div>

        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn btn-sm btn-find-matches" data-type="cargo" data-id="${item.id}" onclick="event.stopPropagation();" title="${t('ai_find_matches_trucks')}">
            <span class="btn-match-icon">${ICONS.radar}</span>
            <span>${t('ai_find_matches_trucks')}</span>
          </button>
          <button class="btn btn-outline btn-sm btn-edit-my-listing" data-id="${item.id}">
            ${ICONS.edit}
            <span>${t('btn_edit')}</span>
          </button>

          ${item.status === 'active' ? `
            <button class="btn btn-danger btn-sm btn-close-my-listing" data-id="${item.id}">
              ${t('btn_close_listing')}
            </button>
          ` : `
            <button class="btn btn-secondary btn-sm btn-reactivate-my-listing" data-id="${item.id}">
              ${t('btn_reactivate_listing')}
            </button>
          `}
        </div>
      </div>
    </div>
  `;
}

// 8. Profile Page View
function renderProfilePage() {
  if (!state.user) return '';

  return `
    <div style="max-width: 600px; margin: 0 auto;">
      <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <h2 style="font-size: 22px; font-weight: 800; color: #fff;">${t('profile_title')}</h2>
            ${state.user.is_verified ? `<span class="verified-badge" title="${t('badge_verified')}">✓ ${t('badge_verified')}</span>` : `<span class="unverified-badge">${t('badge_unverified')}</span>`}
          </div>
          <p style="font-size: 13px; color: var(--text-muted);">${state.user.email} ${state.user.role ? `• ${getRoleLabel(state.user.role)}` : ''}</p>
        </div>
        ${state.user.role === 'admin' ? `
          <a href="#/admin" class="btn btn-secondary btn-sm" style="display: inline-flex; align-items: center; gap: 6px;">
            ${ICONS.shieldCheck}
            <span>${t('nav_admin')}</span>
          </a>
        ` : ''}
      </div>

      <form id="form-update-profile" class="form-card">
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">${t('profile_first_name')} *</label>
            <input type="text" class="form-input" id="profile-first-name" 
              value="${escapeHtml(state.user.first_name || '')}" 
              placeholder="${t('profile_first_name_placeholder')}" required>
          </div>

          <div class="form-group">
            <label class="form-label">${t('profile_last_name')} *</label>
            <input type="text" class="form-input" id="profile-last-name" 
              value="${escapeHtml(state.user.last_name || '')}" 
              placeholder="${t('profile_last_name_placeholder')}" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">${t('profile_phone')} *</label>
          <input type="tel" class="form-input" id="profile-phone" 
            value="${escapeHtml(state.user.phone || '+998')}" 
            placeholder="${t('profile_phone_placeholder')}" required>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
            ${t('profile_phone_hint')}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">${t('profile_role')} *</label>
          <select class="form-select" id="profile-role" required>
            <option value="">${t('profile_role_select')}</option>
            ${state.metadata.business_roles.map(r => `
              <option value="${r.id}" ${state.user.role === r.id ? 'selected' : ''}>
                ${getLocalizedName(r)}
              </option>
            `).join('')}
          </select>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
            ${t('profile_role_hint')}
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px;">
          <button type="submit" class="btn btn-primary" ${state.profileFormSubmitting ? 'disabled' : ''}>
            ${state.profileFormSubmitting ? t('btn_saving') : t('btn_save_profile')}
          </button>
        </div>
      </form>
    </div>
  `;
}

function getLocalizedPlanName(plan) {
  if (!plan) return '';
  const lang = getLanguage();
  const rawUz = (plan.name_uz || plan.name || '').trim();
  const rawRu = (plan.name_ru || '').trim();
  const rawEn = (plan.name_en || '').trim();

  const isStart = rawUz.toLowerCase().includes('start') || rawUz.toLowerCase().includes('boshlang');
  const isPro = rawUz.toLowerCase().includes('pro') || rawUz.toLowerCase().includes('disp');
  const isBiz = rawUz.toLowerCase().includes('biznes') || rawUz.toLowerCase().includes('kompaniy') || rawUz.toLowerCase().includes('business');

  if (isStart) {
    if (lang === 'ru') return 'Старт (Начальный)';
    if (lang === 'en') return 'Start (Starter)';
    return 'Start (Boshlang‘ich)';
  }

  if (isPro) {
    if (lang === 'ru') return 'Про Диспетчер';
    if (lang === 'en') return 'Pro Dispatcher';
    return 'Pro Dispetcher';
  }

  if (isBiz) {
    if (lang === 'ru') return 'Бизнес / Автопарк';
    if (lang === 'en') return 'Business / Fleet';
    return 'Biznes / Kompaniya';
  }

  if (lang === 'ru') return rawRu || rawUz;
  if (lang === 'en') return rawEn || rawUz;
  return rawUz;
}

function getLocalizedPlanDesc(plan) {
  if (!plan) return '';
  const lang = getLanguage();
  const rawUz = (plan.description_uz || plan.description || '').trim();
  const rawRu = (plan.description_ru || '').trim();
  const rawEn = (plan.description_en || '').trim();

  const isStart = plan.price_uzs === 0 || (rawUz && rawUz.toLowerCase().includes('start'));
  const isPro = (rawUz && (rawUz.toLowerCase().includes('pro') || rawUz.toLowerCase().includes('disp'))) || plan.contact_limit === -1;
  const isBiz = (rawUz && (rawUz.toLowerCase().includes('biznes') || rawUz.toLowerCase().includes('business')));

  if (isStart && (!rawRu || !rawEn)) {
    if (lang === 'ru') return '117 бесплатных контактов, стандартные объявления грузов и транспорта, переговоры в чате';
    if (lang === 'en') return '117 free contact reveals, standard cargo & truck listings, direct chat negotiations';
    return '117 ta bepul kontaktlarni ko‘rish, standart yuk va transport e’lonlari, chat orqali narx kelishish';
  }

  if (isPro && (!rawRu || !rawEn || rawUz.includes('kantaktlar') || rawUz.includes('30 kun cheksiz'))) {
    if (lang === 'ru') return '30 дней безлимитного доступа к контактам, бейдж «Верифицирован» и прямая связь';
    if (lang === 'en') return '30 days of unlimited contact reveals, «Verified» badge and direct telephone access';
    return '30 kun cheksiz kontaktlar ochish, «Tasdiqlangan» nishoni va haydovchilar bilan to‘g‘ridan-to‘g‘ri aloqa';
  }

  if (isBiz && (!rawRu || !rawEn)) {
    if (lang === 'ru') return 'Безлимитные контакты, приоритет в выдаче, управление автопарком и поддержка 24/7';
    if (lang === 'en') return 'Unlimited contacts, priority top placement, fleet management and 24/7 dedicated support';
    return 'Cheksiz kontaktlar, e’lonlarning ustuvor ko‘rinishi, avtopark boshqaruvi va 24/7 yordam';
  }

  if (lang === 'ru') return rawRu || rawUz;
  if (lang === 'en') return rawEn || rawUz;
  return rawUz;
}

// 8b. Pricing & Subscriptions Page View
function renderPricingPage() {
  const isSubscriber = Boolean(state.user && state.user.plan_expires_at && new Date(state.user.plan_expires_at) > new Date());
  const freeRemaining = Number(state.user ? (state.user.free_contacts_remaining ?? 117) : 117);

  return `
    <div class="pricing-container">
      <div class="pricing-header">
        <h1 class="pricing-title">💳 ${t('pricing_title')}</h1>
        <p class="pricing-subtitle">${t('pricing_subtitle')}</p>
      </div>

      <!-- Active Status Banner -->
      <div class="pricing-status-banner">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="font-size: 28px;">${isSubscriber ? '⭐' : '📱'}</div>
          <div>
            <div style="font-size: 13px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
              ${t('current_plan_status')}
            </div>
            <div style="font-size: 17px; font-weight: 800; color: #fff; margin-top: 2px;">
              ${state.user ? (
                isSubscriber 
                  ? `${escapeHtml(getLocalizedPlanName(state.user.plan_id ? state.plans.find(p => p.id === state.user.plan_id) : { name_uz: state.user.plan_name }))} — ${t('unlimited_contacts_badge')} (${t('expires_on')}: ${formatDate(state.user.plan_expires_at)})`
                  : `${t('free_contacts_badge')} <span style="color: ${freeRemaining <= 10 ? 'var(--accent-primary)' : 'var(--accent-secondary)'};">${freeRemaining} / 117</span> ${t('contacts_unit')}`
              ) : `
                <span>${t('free_starter_badge')}</span>
              `}
            </div>
          </div>
        </div>
        ${!state.user ? `
          <a href="#/auth" class="btn btn-primary btn-sm">
            ${t('nav_login')} / ${t('nav_register')}
          </a>
        ` : (
          !isSubscriber ? `
            <div style="font-size: 12px; color: var(--text-dim); text-align: right;">
              ${t('free_contacts_hint')}
            </div>
          ` : ''
        )}
      </div>

      <!-- Pricing Plans Grid -->
      <div class="pricing-grid">
        ${state.plansLoading ? `
          <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
            ${t('btn_saving')}
          </div>
        ` : (state.plans.length === 0 ? `
          <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-dim);">
            Tariflar topilmadi
          </div>
        ` : state.plans.map(plan => {
          const isCurrent = state.user && (
            (isSubscriber && state.user.plan_id === plan.id) ||
            (!isSubscriber && plan.price_uzs === 0)
          );
          const name = getLocalizedPlanName(plan);
          const desc = getLocalizedPlanDesc(plan);

          return `
            <div class="pricing-card ${plan.is_popular ? 'popular' : ''} ${isCurrent ? 'active-plan-card' : ''}">
              ${plan.is_popular ? `<div class="popular-badge">⭐ ${t('badge_popular')}</div>` : ''}

              <div class="plan-name">${escapeHtml(name)}</div>
              ${desc ? `<div class="plan-desc">${escapeHtml(desc)}</div>` : ''}

              <div class="plan-price-box">
                <span class="plan-price-val">${plan.price_uzs === 0 ? '0' : formatUzs(plan.price_uzs)}</span>
                <span class="plan-price-currency">UZS</span>
                <span class="plan-duration">/ ${plan.duration_days} ${t('days_unit')}</span>
              </div>

              <div class="plan-features">
                <div class="plan-feature-item">
                  <span class="plan-check">✓</span>
                  <span>${plan.contact_limit === -1 ? t('feature_unlimited_contacts') : t('feature_limited_contacts', { count: plan.contact_limit })}</span>
                </div>
                <div class="plan-feature-item">
                  <span class="plan-check">✓</span>
                  <span>${t('feature_direct_call_chat')}</span>
                </div>
                <div class="plan-feature-item">
                  <span class="plan-check">✓</span>
                  <span>${t('feature_realtime_updates')}</span>
                </div>
                ${plan.price_uzs > 0 ? `
                  <div class="plan-feature-item">
                    <span class="plan-check">✓</span>
                    <span>${t('feature_verified_badge')}</span>
                  </div>
                  <div class="plan-feature-item">
                    <span class="plan-check">✓</span>
                    <span>${t('feature_priority_support')}</span>
                  </div>
                ` : ''}
              </div>

              <div style="margin-top: auto; padding-top: 16px;">
                ${isCurrent ? `
                  <button class="btn btn-outline" style="width: 100%; border-color: rgba(34, 197, 94, 0.4); color: #22c55e;" disabled>
                    ✓ ${t('plan_btn_current')}
                  </button>
                ` : (
                  plan.price_uzs === 0 ? `
                    <button class="btn btn-outline" style="width: 100%;" disabled>
                      ${t('plan_btn_free')}
                    </button>
                  ` : `
                    <button class="btn btn-primary btn-plan-select" data-plan-id="${plan.id}" style="width: 100%;">
                      ${t('plan_btn_subscribe')}
                    </button>
                  `
                )}
              </div>
            </div>
          `;
        }).join(''))}
      </div>

      <!-- Payment Instructions Card -->
      <div class="payment-card-banner">
        <div style="font-size: 24px;">💳</div>
        <div>
          <div style="font-weight: 700; color: #fff; font-size: 15px; margin-bottom: 4px;">
            ${t('payment_instructions_title')}
          </div>
          <div style="font-size: 13px; color: var(--text-muted); line-height: 1.5;">
            ${t('payment_instructions_text')}
          </div>
        </div>
      </div>
    </div>
  `;
}

// 9. Admin Dashboard View
function renderAdminPage() {
  if (!state.user || state.user.role !== 'admin') {
    return `<div style="text-align: center; padding: 40px; color: var(--text-muted);">${t('admin_only_access')}</div>`;
  }

  return `
    <div class="admin-container">
      <div class="admin-header-box">
        <div class="admin-header-title">
          <div style="color: var(--accent-primary);">${ICONS.shieldCheck}</div>
          <div>
            <h1>${t('admin_title')}</h1>
            <p style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">${t('admin_subtitle')}</p>
          </div>
        </div>
        <div class="admin-badge-role">
          Administrator
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="admin-tabs-nav">
        <button class="admin-tab-btn ${state.adminTab === 'overview' ? 'active' : ''}" data-admin-tab="overview">
          📊 ${t('admin_tab_overview')}
        </button>
        <button class="admin-tab-btn ${state.adminTab === 'users' ? 'active' : ''}" data-admin-tab="users">
          👥 ${t('admin_tab_users')}
        </button>
        <button class="admin-tab-btn ${state.adminTab === 'moderation' ? 'active' : ''}" data-admin-tab="moderation">
          🛡️ ${t('admin_tab_moderation')}
        </button>
        <button class="admin-tab-btn ${state.adminTab === 'subscriptions' ? 'active' : ''}" data-admin-tab="subscriptions">
          💳 ${t('admin_tab_subscriptions')}
        </button>
        <button class="admin-tab-btn ${state.adminTab === 'support' ? 'active' : ''}" data-admin-tab="support">
          📞 ${t('admin_tab_support')}
        </button>
      </div>

      <!-- Tab Content -->
      ${state.adminTab === 'overview' ? renderAdminOverview() : ''}
      ${state.adminTab === 'users' ? renderAdminUsers() : ''}
      ${state.adminTab === 'moderation' ? renderAdminModeration() : ''}
      ${state.adminTab === 'subscriptions' ? renderAdminSubscriptions() : ''}
      ${state.adminTab === 'support' ? renderAdminSupport() : ''}
    </div>
  `;
}

function renderAdminOverview() {
  const stats = state.adminStats || {
    users: 0,
    verified_users: 0,
    active_cargo: 0,
    active_transports: 0,
    conversations: 0,
    active_subscriptions: 0,
    pending_requests: 0
  };

  return `
    <div class="kpi-grid">
      <div class="kpi-card accent-orange">
        <div class="kpi-label">👥 ${t('kpi_total_users')}</div>
        <div class="kpi-value">${stats.users}</div>
      </div>
      <div class="kpi-card accent-green">
        <div class="kpi-label">✓ ${t('kpi_verified_users')}</div>
        <div class="kpi-value">${stats.verified_users}</div>
      </div>
      <div class="kpi-card accent-yellow">
        <div class="kpi-label">📦 ${t('kpi_active_cargo')}</div>
        <div class="kpi-value">${stats.active_cargo}</div>
      </div>
      <div class="kpi-card accent-orange">
        <div class="kpi-label">🚛 ${t('kpi_active_transports')}</div>
        <div class="kpi-value">${stats.active_transports}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">💬 ${t('kpi_conversations')}</div>
        <div class="kpi-value">${stats.conversations}</div>
      </div>
      <div class="kpi-card accent-green">
        <div class="kpi-label">💳 ${t('kpi_active_subscriptions')}</div>
        <div class="kpi-value">${stats.active_subscriptions || 0}</div>
      </div>
      <div class="kpi-card ${stats.pending_requests > 0 ? 'accent-orange' : ''}">
        <div class="kpi-label">⏳ ${t('kpi_pending_sub_requests')}</div>
        <div class="kpi-value">${stats.pending_requests || 0}</div>
      </div>
    </div>

    <div style="display: flex; gap: 12px; margin-top: 10px; flex-wrap: wrap;">
      <button class="btn btn-secondary btn-sm" id="btn-admin-jump-users">
        👥 ${t('admin_tab_users')} →
      </button>
      <button class="btn btn-secondary btn-sm" id="btn-admin-jump-moderation">
        🛡️ ${t('admin_tab_moderation')} →
      </button>
      <button class="btn btn-secondary btn-sm" id="btn-admin-jump-subscriptions">
        💳 ${t('admin_tab_subscriptions')} (${stats.pending_requests || 0}) →
      </button>
    </div>
  `;
}

function renderAdminUsers() {
  const users = state.adminUsers || [];

  return `
    <div class="admin-toolbar">
      <div class="admin-search-box">
        <input type="text" id="admin-user-search-input" value="${escapeHtml(state.adminUsersSearch)}" placeholder="${t('admin_search_users_placeholder')}">
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <label style="font-size: 13px; color: var(--text-muted);">${t('user_col_role')}:</label>
        <select id="admin-user-role-filter" class="form-select" style="width: auto; padding: 8px 12px; font-size: 13px;">
          <option value="all" ${state.adminRoleFilter === 'all' ? 'selected' : ''}>${t('admin_filter_all_roles')}</option>
          <option value="admin" ${state.adminRoleFilter === 'admin' ? 'selected' : ''}>Admin</option>
          <option value="dispatcher" ${state.adminRoleFilter === 'dispatcher' ? 'selected' : ''}>Dispatcher</option>
          <option value="driver" ${state.adminRoleFilter === 'driver' ? 'selected' : ''}>Driver</option>
          <option value="cargo_owner" ${state.adminRoleFilter === 'cargo_owner' ? 'selected' : ''}>Cargo Owner</option>
          <option value="user" ${state.adminRoleFilter === 'user' ? 'selected' : ''}>User</option>
        </select>
      </div>
    </div>

    <div class="admin-table-card">
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>${t('user_col_name')}</th>
              <th>${t('user_col_contact')}</th>
              <th>${t('user_col_role')}</th>
              <th>${t('user_col_plan')}</th>
              <th>${t('user_col_status')}</th>
              <th style="text-align: right;">${t('user_col_actions')}</th>
            </tr>
          </thead>
          <tbody>
            ${state.adminUsersLoading ? `
              <tr>
                <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">${t('btn_saving')}</td>
              </tr>
            ` : (users.length === 0 ? `
              <tr>
                <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-dim);">Foydalanuvchilar topilmadi</td>
              </tr>
            ` : users.map(u => {
              const fullName = (u.first_name || u.last_name) ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : '—';
              const isSelf = u.id === state.user.id;
              const isBanned = Boolean(u.is_banned);
              const isVerified = Boolean(u.is_verified);

              return `
                <tr data-user-id="${u.id}">
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div class="user-avatar-circle" style="width: 28px; height: 28px; font-size: 12px;">
                        ${(u.first_name?.[0] || u.email[0]).toUpperCase()}
                      </div>
                      <div>
                        <div style="font-weight: 600; color: #fff;">${escapeHtml(fullName)} ${isSelf ? '<span style="color: var(--accent-primary); font-size: 11px;">(Siz)</span>' : ''}</div>
                        <div style="font-size: 11px; color: var(--text-dim);">${formatDate(u.created_at)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>${escapeHtml(u.email)}</div>
                    ${u.phone ? `<div style="font-size: 11px; color: var(--text-muted);">${escapeHtml(u.phone)}</div>` : ''}
                  </td>
                  <td>
                    <select class="admin-role-select admin-user-role-select" data-user-id="${u.id}" ${isSelf ? 'disabled title="O‘z rolingizni o‘zgartira olmaysiz"' : ''}>
                      <option value="user" ${u.role === 'user' ? 'selected' : ''}>User</option>
                      <option value="driver" ${u.role === 'driver' ? 'selected' : ''}>Driver</option>
                      <option value="dispatcher" ${u.role === 'dispatcher' ? 'selected' : ''}>Dispatcher</option>
                      <option value="cargo_owner" ${u.role === 'cargo_owner' ? 'selected' : ''}>Cargo Owner</option>
                      <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: #fff; font-size: 13px;">
                      ${u.plan_name ? `<span class="verified-badge" style="background: rgba(255,122,0,0.15); border-color: rgba(255,122,0,0.4); color: var(--accent-primary);">${escapeHtml(u.plan_name)}</span>` : '<span style="color: var(--text-dim);">Start</span>'}
                    </div>
                    <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px;">
                      ${u.plan_expires_at ? `${t('expires_on')}: ${formatDate(u.plan_expires_at)}` : `📱 ${u.free_contacts_remaining ?? 117} ${t('contacts_unit')}`}
                    </div>
                  </td>
                  <td>
                    <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                      ${isVerified ? `
                        <span class="verified-badge">✓ ${t('badge_verified')}</span>
                      ` : `
                        <span class="unverified-badge">${t('badge_unverified')}</span>
                      `}
                      ${isBanned ? `
                        <span class="banned-badge">✕ ${t('badge_banned')}</span>
                      ` : `
                        <span class="verified-badge" style="background: rgba(59, 130, 246, 0.1); border-color: rgba(59, 130, 246, 0.3); color: #60a5fa;">${t('badge_active')}</span>
                      `}
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <div class="admin-actions-cell" style="justify-content: flex-end;">
                      <button class="btn-admin-action verify btn-admin-grant-sub" data-user-id="${u.id}" data-user-name="${escapeHtml(fullName)}" title="${t('btn_grant_plan')}">
                        💳 ${t('btn_grant_plan')}
                      </button>
                      <button class="btn-admin-action unverify btn-admin-reset-contacts" data-user-id="${u.id}" title="${t('btn_reset_contacts')}">
                        🔄 117
                      </button>
                      <button class="btn-admin-action ${isVerified ? 'unverify' : 'verify'} btn-admin-verify-toggle" data-user-id="${u.id}" data-verified="${isVerified ? '1' : '0'}">
                        ${isVerified ? t('btn_unverify') : t('btn_verify')}
                      </button>
                      ${!isSelf ? `
                        <button class="btn-admin-action ${isBanned ? 'unban' : 'ban'} btn-admin-ban-toggle" data-user-id="${u.id}" data-banned="${isBanned ? '1' : '0'}">
                          ${isBanned ? t('btn_unban') : t('btn_ban')}
                        </button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `;
            }).join(''))}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderAdminSubscriptions() {
  const reqs = state.adminSubRequests || [];
  const plans = state.adminPlans || [];

  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--surface-border); padding-bottom: 10px; flex-wrap: wrap; gap: 10px;">
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="btn ${state.adminSubTab === 'requests' ? 'btn-primary' : 'btn-outline'} btn-sm admin-sub-tab-btn" data-sub-tab="requests">
          ⏳ ${t('admin_sub_tab_requests')} (${reqs.length})
        </button>
        <button class="btn ${state.adminSubTab === 'plans' ? 'btn-primary' : 'btn-outline'} btn-sm admin-sub-tab-btn" data-sub-tab="plans">
          🏷️ ${t('admin_sub_tab_plans')} (${plans.length})
        </button>
        <button class="btn ${state.adminSubTab === 'payment' ? 'btn-primary' : 'btn-outline'} btn-sm admin-sub-tab-btn" data-sub-tab="payment">
          💳 ${t('admin_sub_tab_payment_settings')}
        </button>
      </div>

      ${state.adminSubTab === 'plans' ? `
        <button class="btn btn-primary btn-sm" id="btn-admin-open-add-plan">
          + ${t('btn_add_plan')}
        </button>
      ` : ''}
    </div>

    ${state.adminSubTab === 'requests' ? `
      <div class="admin-table-card">
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>${t('request_col_user')}</th>
                <th>${t('request_col_plan')}</th>
                <th>${t('request_col_receipt')}</th>
                <th>${t('request_col_date')}</th>
                <th>${t('request_col_status')}</th>
                <th style="text-align: right;">${t('user_col_actions')}</th>
              </tr>
            </thead>
            <tbody>
              ${reqs.length === 0 ? `
                <tr>
                  <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-dim);">${t('no_subscription_requests')}</td>
                </tr>
              ` : reqs.map(r => {
                const userName = (r.first_name || r.last_name) ? `${r.first_name || ''} ${r.last_name || ''}`.trim() : r.email;
                const isPending = r.status === 'pending';

                return `
                  <tr data-req-id="${r.id}">
                    <td>
                      <div style="font-weight: 600; color: #fff;">${escapeHtml(userName)}</div>
                      <div style="font-size: 11px; color: var(--text-dim);">${escapeHtml(r.email)} ${r.phone ? `• ${escapeHtml(r.phone)}` : ''}</div>
                    </td>
                    <td>
                      <div style="font-weight: 600; color: var(--accent-primary);">${escapeHtml(getLocalizedPlanName({ name_uz: r.plan_name_uz, name_ru: r.plan_name_ru, name_en: r.plan_name_en }) || r.plan_name_uz || t('pricing_title'))}</div>
                      <div style="font-size: 11px; color: var(--text-muted);">${formatUzs(r.plan_price_uzs || r.plan_price)} UZS / ${r.duration_days || r.plan_duration_days} ${t('days_unit')}</div>
                    </td>
                    <td>
                      <div style="font-size: 12px; color: var(--text-primary); max-width: 250px; white-space: pre-wrap; word-break: break-word;">
                        ${escapeHtml(r.receipt_note || '—')}
                      </div>
                    </td>
                    <td>
                      <div style="font-size: 12px; color: var(--text-muted);">${formatDate(r.created_at)}</div>
                    </td>
                    <td>
                      <span class="badge ${r.status === 'approved' ? 'badge-active' : r.status === 'rejected' ? 'badge-closed' : 'badge-pending'}">
                        ${r.status === 'approved' ? t('status_approved') : r.status === 'rejected' ? t('status_rejected') : t('status_pending')}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      ${isPending ? `
                        <div class="admin-actions-cell" style="justify-content: flex-end;">
                          <button class="btn-admin-action verify btn-admin-approve-sub" data-req-id="${r.id}">
                            ✓ ${t('btn_approve')}
                          </button>
                          <button class="btn-admin-action ban btn-admin-reject-sub" data-req-id="${r.id}">
                            ✕ ${t('btn_reject')}
                          </button>
                        </div>
                      ` : `
                        <span style="font-size: 12px; color: var(--text-dim);">—</span>
                      `}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    ` : state.adminSubTab === 'plans' ? `
      <div class="admin-sub-grid">
        ${plans.map(p => `
          <div class="admin-plan-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <div style="font-size: 16px; font-weight: 700; color: #fff;">${escapeHtml(getLocalizedPlanName(p))}</div>
                <div style="font-size: 12px; color: var(--text-muted);">${escapeHtml(getLocalizedPlanDesc(p))}</div>
              </div>
              ${p.is_popular ? `<span class="popular-badge" style="position: static; font-size: 11px;">⭐ ${t('badge_popular')}</span>` : ''}
            </div>

            <div style="margin: 12px 0; font-size: 20px; font-weight: 800; color: var(--accent-secondary);">
              ${p.price_uzs === 0 ? '0' : formatUzs(p.price_uzs)} UZS
              <span style="font-size: 12px; font-weight: normal; color: var(--text-muted);">/ ${p.duration_days} ${t('days_unit')}</span>
            </div>

            <div style="font-size: 12px; color: var(--text-primary); margin-bottom: 12px;">
              <div>📱 <strong>${p.contact_limit === -1 ? t('feature_unlimited_contacts') : `${p.contact_limit} ${t('contacts_unit')}`}</strong></div>
              <div style="margin-top: 4px;">${t('user_col_status')}: <span class="badge ${p.is_active ? 'badge-active' : 'badge-closed'}">${p.is_active ? t('badge_active') : (t('status_inactive') || 'Nofaol')}</span></div>
            </div>

            <div style="display: flex; gap: 8px; justify-content: flex-end; border-top: 1px solid var(--surface-border-subtle); padding-top: 10px;">
              <button class="btn-admin-action delete btn-admin-delete-plan" data-plan-id="${p.id}">
                🗑️ ${t('btn_delete_listing')}
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    ` : renderAdminPaymentSettings()}
  `;
}

function renderAdminPaymentSettings() {
  const settings = state.paymentSettings || {};
  const lang = getLanguage();
  const currentInst = lang === 'ru' 
    ? (settings.instructions_ru || settings.instructions_uz || '') 
    : lang === 'en' 
      ? (settings.instructions_en || settings.instructions_uz || '') 
      : (settings.instructions_uz || '');

  return `
    <div style="background: var(--surface-bg); border: 1px solid var(--surface-border); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <div style="margin-bottom: 20px;">
        <h3 style="margin: 0 0 6px 0; font-size: 18px; color: #fff; display: flex; align-items: center; gap: 8px;">
          💳 ${t('payment_settings_title')}
        </h3>
        <p style="margin: 0; font-size: 13px; color: var(--text-muted);">
          ${t('payment_settings_subtitle')}
        </p>
      </div>

      <div class="admin-payment-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; align-items: start;">
        <!-- Left Column: Form -->
        <form id="form-admin-payment-settings" style="display: flex; flex-direction: column; gap: 16px;">
          <div class="form-group">
            <label class="form-label">${t('label_card_number')} *</label>
            <input type="text" class="form-input" id="admin-card-number" 
              value="${escapeHtml(settings.card_number || '')}" 
              placeholder="9860 0301 4455 8899" required
              style="font-family: monospace; font-size: 16px; font-weight: 700; letter-spacing: 1px;">
          </div>

          <div class="form-group">
            <label class="form-label">${t('label_card_holder')} *</label>
            <input type="text" class="form-input" id="admin-card-holder" 
              value="${escapeHtml(settings.card_holder || '')}" 
              placeholder="Humo Logistics MCHJ" required>
          </div>

          <div class="form-group">
            <label class="form-label">${t('label_card_bank')}</label>
            <input type="text" class="form-input" id="admin-card-bank" 
              value="${escapeHtml(settings.card_bank || '')}" 
              placeholder="Humo / Uzcard / Click / Payme">
          </div>

          <div class="form-group">
            <label class="form-label">${t('label_instructions_uz')}</label>
            <textarea class="form-textarea" id="admin-card-inst-uz" rows="2" 
              placeholder="Click, Payme yoki bank ilovasi orqali to‘lov qiling...">${escapeHtml(settings.instructions_uz || '')}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label">${t('label_instructions_ru')}</label>
            <textarea class="form-textarea" id="admin-card-inst-ru" rows="2" 
              placeholder="Оплатите через Click, Payme или банковское приложение...">${escapeHtml(settings.instructions_ru || '')}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label">${t('label_instructions_en')}</label>
            <textarea class="form-textarea" id="admin-card-inst-en" rows="2" 
              placeholder="Pay via Click, Payme or banking app...">${escapeHtml(settings.instructions_en || '')}</textarea>
          </div>

          <div style="margin-top: 8px;">
            <button type="submit" class="btn btn-primary" id="btn-save-pay-settings" style="width: 100%; justify-content: center; padding: 12px; font-weight: 700;">
              💾 ${t('btn_save_payment_settings')}
            </button>
          </div>
        </form>

        <!-- Right Column: Live Customer Preview -->
        <div>
          <div style="font-size: 13px; font-weight: 700; color: var(--accent-secondary); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            👁️ ${t('preview_customer_title')}
          </div>

          <!-- Stylized Bank Card Mockup -->
          <div class="payment-card-mockup" style="background: linear-gradient(135deg, #222222 0%, #151515 50%, #2e1800 100%); border: 1px solid rgba(255, 122, 0, 0.45); border-radius: 14px; padding: 22px; box-shadow: 0 10px 25px rgba(0,0,0,0.6); position: relative; overflow: hidden; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
              <div style="font-size: 12px; font-weight: 800; color: var(--accent-primary); letter-spacing: 2px;">
                HUMO LOGISTICS PAY
              </div>
              <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);" id="preview-card-bank">
                ${escapeHtml(settings.card_bank || 'Humo / Uzcard')}
              </div>
            </div>

            <!-- Chip & Contactless icon -->
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
              <div style="width: 40px; height: 30px; background: linear-gradient(135deg, #ffd700, #b8860b); border-radius: 6px; border: 1px solid rgba(0,0,0,0.4); position: relative;">
                <div style="position: absolute; top: 8px; left: 0; right: 0; height: 1px; background: rgba(0,0,0,0.25);"></div>
                <div style="position: absolute; bottom: 8px; left: 0; right: 0; height: 1px; background: rgba(0,0,0,0.25);"></div>
                <div style="position: absolute; left: 19px; top: 0; bottom: 0; width: 1px; background: rgba(0,0,0,0.25);"></div>
              </div>
              <div style="font-size: 18px; color: rgba(255,255,255,0.4);">📶</div>
            </div>

            <!-- Card Number -->
            <div id="preview-card-number" style="font-size: 20px; font-weight: 800; color: #fff; font-family: monospace; letter-spacing: 2px; margin-bottom: 18px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
              ${escapeHtml(settings.card_number || '9860 0301 4455 8899')}
            </div>

            <!-- Card Holder -->
            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
              <div>
                <div style="font-size: 9px; text-transform: uppercase; color: var(--text-dim); letter-spacing: 1px;">CARD HOLDER</div>
                <div id="preview-card-holder" style="font-size: 14px; font-weight: 700; color: #fff; letter-spacing: 1px; text-transform: uppercase;">
                  ${escapeHtml(settings.card_holder || 'Humo Logistics MCHJ')}
                </div>
              </div>
              <div style="font-size: 26px;">💳</div>
            </div>
          </div>

          <!-- Live Modal Banner Preview -->
          <div style="background: rgba(255, 122, 0, 0.08); border: 1px dashed rgba(255, 122, 0, 0.3); border-radius: 8px; padding: 14px;">
            <div style="font-size: 11px; font-weight: 700; color: var(--accent-primary); text-transform: uppercase; margin-bottom: 6px;">
              🏦 ${t('bank_transfer_details')} (${t('nav_pricing')})
            </div>
            <div id="preview-modal-instructions" style="font-size: 12px; color: var(--text-muted); line-height: 1.5;">
              ${escapeHtml(currentInst)}
            </div>
          </div>

          <div style="margin-top: 10px; font-size: 12px; color: var(--text-dim); line-height: 1.4;">
            💡 ${t('preview_customer_hint')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAdminModeration() {
  const cargoList = state.adminListings.cargo || [];
  const truckList = state.adminListings.transports || [];

  return `
    <div style="display: flex; gap: 10px; margin-bottom: 16px; border-bottom: 1px solid var(--surface-border); padding-bottom: 8px;">
      <button class="btn ${state.adminModerationTab === 'cargo' ? 'btn-primary' : 'btn-outline'} btn-sm admin-mod-tab-btn" data-mod-tab="cargo">
        📦 ${t('admin_mod_cargo')} (${cargoList.length})
      </button>
      <button class="btn ${state.adminModerationTab === 'transports' ? 'btn-primary' : 'btn-outline'} btn-sm admin-mod-tab-btn" data-mod-tab="transports">
        🚛 ${t('admin_mod_transports')} (${truckList.length})
      </button>
    </div>

    ${state.adminListingsLoading ? `
      <div style="text-align: center; padding: 40px; color: var(--text-muted);">${t('btn_saving')}</div>
    ` : (state.adminModerationTab === 'cargo' ? `
      ${cargoList.length === 0 ? `
        <div style="text-align: center; padding: 30px; color: var(--text-dim);">Hech qanday yuk e’loni topilmadi</div>
      ` : `
        <div class="admin-mod-grid">
          ${cargoList.map(item => {
            const orig = getLocalityLabel(item.origin_country, item.origin_locality, item.origin_custom);
            const dest = getLocalityLabel(item.destination_country, item.destination_locality, item.destination_custom);
            const owner = item.owner_name ? `${item.owner_name} (${item.owner_email})` : item.owner_email;

            return `
              <div class="admin-mod-card">
                <div class="admin-mod-info">
                  <div class="admin-mod-route">📍 ${orig} → ${dest}</div>
                  <div style="font-weight: 600; color: var(--accent-secondary); font-size: 14px;">${escapeHtml(item.cargo_name)}</div>
                  <div class="admin-mod-details">
                    <span>${item.weight} t • ${item.volume || '—'} m³ • ${getBodyTypeLabel(item.body_type)}</span>
                    <span style="margin-left: 8px; color: var(--accent-primary);">${formatPrice(item)}</span>
                    <span class="badge ${item.status === 'active' ? 'badge-active' : 'badge-closed'}" style="margin-left: 8px;">${item.status}</span>
                  </div>
                  <div class="admin-mod-owner" style="margin-top: 4px;">
                    👤 <span>${escapeHtml(owner)}</span>
                    <span style="font-size: 11px; color: var(--text-dim); margin-left: 6px;">(${formatDate(item.created_at)})</span>
                  </div>
                </div>
                <div>
                  <button class="btn-admin-action delete btn-admin-delete-listing" data-type="cargo" data-id="${item.id}">
                    🗑️ ${t('btn_delete_listing')}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    ` : `
      ${truckList.length === 0 ? `
        <div style="text-align: center; padding: 30px; color: var(--text-dim);">Hech qanday transport e’loni topilmadi</div>
      ` : `
        <div class="admin-mod-grid">
          ${truckList.map(item => {
            const orig = getLocalityLabel(item.origin_country, item.origin_city);
            const dest = item.destination_country ? getLocalityLabel(item.destination_country, item.destination_city) : t('any_direction');
            const owner = item.owner_name ? `${item.owner_name} (${item.owner_email})` : item.owner_email;

            return `
              <div class="admin-mod-card">
                <div class="admin-mod-info">
                  <div class="admin-mod-route">🚛 ${orig} → ${dest}</div>
                  <div style="font-weight: 600; color: #fff; font-size: 14px;">${escapeHtml(item.truck_model || 'Yuk mashinasi')}</div>
                  <div class="admin-mod-details">
                    <span>${item.max_weight} t • ${item.volume || '—'} m³ • ${getBodyTypeLabel(item.body_type)}</span>
                    ${item.price_expectation ? `<span style="margin-left: 8px; color: var(--accent-secondary);">${escapeHtml(item.price_expectation)}</span>` : ''}
                    <span class="badge ${item.status === 'active' ? 'badge-active' : 'badge-closed'}" style="margin-left: 8px;">${item.status}</span>
                  </div>
                  <div class="admin-mod-owner" style="margin-top: 4px;">
                    👤 <span>${escapeHtml(owner)}</span>
                    ${item.phone ? `<span style="margin-left: 8px;">📞 ${escapeHtml(item.phone)}</span>` : ''}
                    <span style="font-size: 11px; color: var(--text-dim); margin-left: 6px;">(${formatDate(item.created_at)})</span>
                  </div>
                </div>
                <div>
                  <button class="btn-admin-action delete btn-admin-delete-listing" data-type="transport" data-id="${item.id}">
                    🗑️ ${t('btn_delete_listing')}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    `)}
  `;
}

// Admin Support & Socials View
function renderAdminSupport() {
  const sup = state.supportSettings || {
    phone: '+998 71 200 44 44',
    email: 'support@humologistics.uz',
    telegram_support: 'https://t.me/humologistics_support',
    whatsapp_support: 'https://wa.me/998901234567',
    working_hours_uz: 'Dushanba - Shanba: 09:00 - 19:00',
    working_hours_ru: 'Понедельник - Суббота: 09:00 - 19:00',
    working_hours_en: 'Monday - Saturday: 09:00 - 19:00',
    address_uz: 'Toshkent shahri, Amir Temur shox ko‘chasi, 107-uy',
    address_ru: 'г. Ташкент, проспект Амира Темура, 107',
    address_en: '107, Amir Temur Avenue, Tashkent, Uzbekistan',
    is_widget_enabled: true
  };
  const socials = state.adminSocials || [];

  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--surface-border); padding-bottom: 10px; flex-wrap: wrap; gap: 10px;">
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="btn ${state.adminSupportTab === 'contacts' ? 'btn-primary' : 'btn-outline'} btn-sm admin-sup-tab-btn" data-sup-tab="contacts">
          📞 ${t('admin_support_tab_contacts')}
        </button>
        <button class="btn ${state.adminSupportTab === 'socials' ? 'btn-primary' : 'btn-outline'} btn-sm admin-sup-tab-btn" data-sup-tab="socials">
          🌐 ${t('admin_support_tab_socials')} (${socials.length})
        </button>
      </div>

      ${state.adminSupportTab === 'socials' ? `
        <button class="btn btn-primary btn-sm" id="btn-admin-open-add-social">
          + ${t('btn_add_social')}
        </button>
      ` : ''}
    </div>

    ${state.adminSupportTab === 'contacts' ? `
      <!-- Sub-tab 1: Contacts & Working Hours -->
      <div class="admin-card" style="padding: 24px;">
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 4px;">
            ${t('admin_support_title')}
          </h2>
          <p style="font-size: 13px; color: var(--text-muted);">
            ${t('admin_support_subtitle')}
          </p>
        </div>

        <form id="form-admin-support-settings">
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">${t('label_support_phone')} *</label>
              <input type="text" class="form-input" id="sup-phone" value="${escapeHtml(sup.phone || '')}" placeholder="+998 71 200 44 44" required>
            </div>
            <div class="form-group">
              <label class="form-label">${t('label_support_email')} *</label>
              <input type="email" class="form-input" id="sup-email" value="${escapeHtml(sup.email || '')}" placeholder="support@humologistics.uz" required>
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">${t('label_telegram_support')}</label>
              <input type="text" class="form-input" id="sup-telegram" value="${escapeHtml(sup.telegram_support || '')}" placeholder="https://t.me/humologistics_support">
            </div>
            <div class="form-group">
              <label class="form-label">${t('label_whatsapp_support')}</label>
              <input type="text" class="form-input" id="sup-whatsapp" value="${escapeHtml(sup.whatsapp_support || '')}" placeholder="https://wa.me/998901234567">
            </div>
          </div>

          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">${t('label_working_hours_uz')}</label>
              <input type="text" class="form-input" id="sup-hours-uz" value="${escapeHtml(sup.working_hours_uz || '')}" placeholder="Dushanba - Shanba: 09:00 - 19:00">
            </div>
            <div class="form-group">
              <label class="form-label">${t('label_working_hours_ru')}</label>
              <input type="text" class="form-input" id="sup-hours-ru" value="${escapeHtml(sup.working_hours_ru || '')}" placeholder="Понедельник - Суббота: 09:00 - 19:00">
            </div>
            <div class="form-group">
              <label class="form-label">${t('label_working_hours_en')}</label>
              <input type="text" class="form-input" id="sup-hours-en" value="${escapeHtml(sup.working_hours_en || '')}" placeholder="Monday - Saturday: 09:00 - 19:00">
            </div>
          </div>

          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">${t('label_address_uz')}</label>
              <input type="text" class="form-input" id="sup-addr-uz" value="${escapeHtml(sup.address_uz || '')}" placeholder="Toshkent shahri, Amir Temur ko‘chasi, 107">
            </div>
            <div class="form-group">
              <label class="form-label">${t('label_address_ru')}</label>
              <input type="text" class="form-input" id="sup-addr-ru" value="${escapeHtml(sup.address_ru || '')}" placeholder="г. Ташкент, проспект Амира Темура, 107">
            </div>
            <div class="form-group">
              <label class="form-label">${t('label_address_en')}</label>
              <input type="text" class="form-input" id="sup-addr-en" value="${escapeHtml(sup.address_en || '')}" placeholder="107, Amir Temur Avenue, Tashkent">
            </div>
          </div>

          <div class="form-group" style="display: flex; align-items: center; gap: 10px; margin-top: 10px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid var(--surface-border);">
            <input type="checkbox" id="sup-widget-enabled" style="width: 20px; height: 20px; accent-color: var(--accent-primary);" ${sup.is_widget_enabled ? 'checked' : ''}>
            <label for="sup-widget-enabled" style="font-size: 14px; color: #fff; cursor: pointer; font-weight: 600;">
              🎧 ${t('label_widget_enabled')}
            </label>
          </div>

          <div class="form-group" style="display: flex; align-items: center; gap: 10px; margin-top: 8px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid var(--surface-border);">
            <input type="checkbox" id="sup-address-enabled" style="width: 20px; height: 20px; accent-color: var(--accent-primary);" ${sup.is_address_enabled !== 0 && sup.is_address_enabled !== false ? 'checked' : ''}>
            <label for="sup-address-enabled" style="font-size: 14px; color: #fff; cursor: pointer; font-weight: 600;">
              📍 ${t('label_address_enabled')}
            </label>
          </div>

          <div style="margin-top: 20px;">
            <button type="submit" class="btn btn-primary" id="btn-save-support-settings" style="padding: 12px 24px; font-weight: 700;">
              💾 ${t('btn_save_support_settings')}
            </button>
          </div>
        </form>
      </div>
    ` : `
      <!-- Sub-tab 2: Social Networks Table & CRUD -->
      <div class="admin-table-card">
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th style="width: 60px;">Logo</th>
                <th>${t('label_social_platform')} / ${t('label_social_title')}</th>
                <th>${t('label_social_url')}</th>
                <th style="width: 100px;">${t('label_social_sort')}</th>
                <th style="width: 100px;">${t('user_col_status')}</th>
                <th style="text-align: right; width: 140px;">${t('user_col_actions')}</th>
              </tr>
            </thead>
            <tbody>
              ${socials.length === 0 ? `
                <tr>
                  <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-dim);">
                    Hozircha hech qanday ijtimoiy tarmoq qo‘shilmagan. Yuqoridagi "+ ${t('btn_add_social')}" tugmasi orqali qo‘shing.
                  </td>
                </tr>
              ` : socials.map(s => {
                const color = getSocialColor(s.platform);
                return `
                  <tr data-social-id="${s.id}">
                    <td>
                      <div class="admin-social-icon-preview" style="color: ${color}; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.06); border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                        ${getSocialIcon(s.platform, 22)}
                      </div>
                    </td>
                    <td>
                      <div style="font-weight: 700; color: #fff; display: flex; align-items: center; gap: 6px;">
                        <span>${escapeHtml(s.title || s.platform)}</span>
                        <span style="font-size: 11px; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.08); color: var(--text-muted); text-transform: capitalize;">${escapeHtml(s.platform)}</span>
                      </div>
                    </td>
                    <td>
                      <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-secondary); font-size: 12px; text-decoration: none; word-break: break-all;">
                        ${escapeHtml(s.url)}
                      </a>
                    </td>
                    <td>
                      <span style="font-size: 13px; font-weight: 700; color: var(--text-muted);">${s.sort_order || 0}</span>
                    </td>
                    <td>
                      <span class="badge ${s.is_active ? 'badge-active' : 'badge-closed'}">
                        ${s.is_active ? t('badge_active') : t('status_rejected')}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <div class="admin-actions-cell" style="justify-content: flex-end;">
                        <button class="btn-admin-action verify btn-admin-edit-social" data-id="${s.id}">
                          ✏️ ${t('btn_edit')}
                        </button>
                        <button class="btn-admin-action ban btn-admin-delete-social" data-id="${s.id}">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `}
  `;
}

// Site Footer View
function renderFooter() {
  const sup = state.supportSettings || {};
  const lang = getLanguage();
  const workingHours = (lang === 'ru' ? sup.working_hours_ru : lang === 'en' ? sup.working_hours_en : sup.working_hours_uz) || sup.working_hours_uz || '';
  const address = (lang === 'ru' ? sup.address_ru : lang === 'en' ? sup.address_en : sup.address_uz) || sup.address_uz || '';
  const phone = sup.phone || '+998 71 200 44 44';
  const email = sup.email || 'support@humologistics.uz';
  const socials = (state.socialLinks || []).filter(s => s.is_active);
  const showAddress = Boolean(sup.is_address_enabled !== 0 && sup.is_address_enabled !== false && address && address.trim());
  const showWorkingHours = Boolean(workingHours && workingHours.trim());

  return `
    <footer class="site-footer">
      <div class="footer-container">
        <!-- Brand & Slogan -->
        <div class="footer-col brand-col">
          <div class="footer-brand-title">
            <img src="/bird.png" alt="Humo Logistics" class="footer-brand-logo">
            <span>Humo Logistics</span>
          </div>
          <p class="footer-brand-desc">
            ${t('footer_brand_desc')}
          </p>
          <div class="footer-badge-security">
            <span class="footer-badge-security-icon">${ICONS.shieldCheck}</span>
            <span>O‘zbekiston Milliy Logistika Standartlari</span>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="footer-col">
          <h4 class="footer-col-title">${t('footer_quick_links')}</h4>
          <ul class="footer-links-list">
            <li>
              <a href="#/" class="footer-quick-link">
                <span class="footer-quick-icon icon-home">${ICONS.home}</span>
                <span class="footer-quick-text">${t('nav_home')}</span>
                <span class="footer-quick-arrow">${ICONS.chevronRight}</span>
              </a>
            </li>
            <li>
              <a href="#/cargo" class="footer-quick-link">
                <span class="footer-quick-icon icon-cargo">${ICONS.box}</span>
                <span class="footer-quick-text">${t('nav_cargo')}</span>
                <span class="footer-quick-arrow">${ICONS.chevronRight}</span>
              </a>
            </li>
            <li>
              <a href="#/trucks" class="footer-quick-link">
                <span class="footer-quick-icon icon-trucks">${ICONS.steering}</span>
                <span class="footer-quick-text">${t('nav_trucks')}</span>
                <span class="footer-quick-arrow">${ICONS.chevronRight}</span>
              </a>
            </li>
            <li>
              <a href="#/publish" class="footer-quick-link">
                <span class="footer-quick-icon icon-publish">${ICONS.add}</span>
                <span class="footer-quick-text">${t('nav_publish')}</span>
                <span class="footer-quick-arrow">${ICONS.chevronRight}</span>
              </a>
            </li>
            <li>
              <a href="#/pricing" class="footer-quick-link">
                <span class="footer-quick-icon icon-pricing">${ICONS.creditCard}</span>
                <span class="footer-quick-text">${t('nav_pricing')}</span>
                <span class="footer-quick-arrow">${ICONS.chevronRight}</span>
              </a>
            </li>
            ${state.user ? `
              <li>
                <a href="#/profile" class="footer-quick-link">
                  <span class="footer-quick-icon icon-profile">${ICONS.user}</span>
                  <span class="footer-quick-text">${t('nav_profile')}</span>
                  <span class="footer-quick-arrow">${ICONS.chevronRight}</span>
                </a>
              </li>
            ` : `
              <li>
                <a href="#/auth" class="footer-quick-link">
                  <span class="footer-quick-icon icon-auth">${ICONS.key}</span>
                  <span class="footer-quick-text">${t('nav_login')}</span>
                  <span class="footer-quick-arrow">${ICONS.chevronRight}</span>
                </a>
              </li>
            `}
          </ul>
        </div>

        <!-- Support & Contacts -->
        <div class="footer-col">
          <h4 class="footer-col-title">${t('footer_contacts')}</h4>
          <div class="footer-contact-item">
            <span class="footer-icon">${ICONS.phone}</span>
            <div>
              <div class="footer-item-label">${t('label_support_phone')}</div>
              <a href="tel:${phone.replace(/\s+/g, '')}" class="footer-item-val link">${escapeHtml(phone)}</a>
            </div>
          </div>
          <div class="footer-contact-item">
            <span class="footer-icon">${ICONS.mail}</span>
            <div>
              <div class="footer-item-label">${t('label_support_email')}</div>
              <a href="mailto:${email}" class="footer-item-val link">${escapeHtml(email)}</a>
            </div>
          </div>
          ${showWorkingHours ? `
            <div class="footer-contact-item">
              <span class="footer-icon">${ICONS.clock}</span>
              <div>
                <div class="footer-item-label">${t('widget_working_hours')}</div>
                <div class="footer-item-val">${escapeHtml(workingHours)}</div>
              </div>
            </div>
          ` : ''}
          ${showAddress ? `
            <div class="footer-contact-item">
              <span class="footer-icon">${ICONS.mapPin}</span>
              <div>
                <div class="footer-item-label">${t('widget_address')}</div>
                <div class="footer-item-val">${escapeHtml(address)}</div>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Social Media Channels with Official Brand Logos -->
        <div class="footer-col">
          <h4 class="footer-col-title">${t('footer_socials_title')}</h4>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px; line-height: 1.4;">
            ${t('footer_socials_subtitle')}
          </p>
          <div class="footer-socials-grid">
            ${socials.length === 0 ? `
              <div style="font-size: 12px; color: var(--text-dim);">Ijtimoiy tarmoqlar ulanmoqda...</div>
            ` : socials.map(s => {
              const color = getSocialColor(s.platform);
              return `
                <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" 
                  class="social-btn" 
                  style="--soc-color: ${color};" 
                  title="${escapeHtml(s.title || s.platform)}">
                  <span class="social-btn-icon">${getSocialIcon(s.platform, 20)}</span>
                  <span class="social-btn-label">${escapeHtml(s.title || s.platform)}</span>
                </a>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <div class="footer-bottom-bar">
        <div>${t('footer_copyright')}</div>
        <div class="footer-bottom-links">
          <span style="display: inline-flex; align-items: center; gap: 6px;">
            <span class="status-indicator online"></span> 24/7 Platforma faol
          </span>
          <span>•</span>
          <span>Toshkent, O‘zbekiston</span>
        </div>
      </div>
    </footer>
  `;
}

// Floating Support Extension / Widget
function renderFloatingSupportWidget() {
  const sup = state.supportSettings;
  // If widget explicitly disabled by admin, return empty
  if (sup && (sup.is_widget_enabled === 0 || sup.is_widget_enabled === false)) {
    return '';
  }

  const phone = (sup && sup.phone) ? sup.phone : '+998 71 200 44 44';
  const email = (sup && sup.email) ? sup.email : 'support@humologistics.uz';
  const tg = (sup && sup.telegram_support) ? sup.telegram_support : 'https://t.me/humologistics_support';
  const tgUrl = tg.startsWith('http') ? tg : `https://t.me/${tg.replace('@', '')}`;
  const wa = (sup && sup.whatsapp_support) ? sup.whatsapp_support : 'https://wa.me/998901234567';
  const waUrl = wa.startsWith('http') ? wa : `https://wa.me/${wa.replace(/[^0-9]/g, '')}`;

  const lang = getLanguage();
  const workingHours = (sup && (lang === 'ru' ? sup.working_hours_ru : lang === 'en' ? sup.working_hours_en : sup.working_hours_uz)) || (sup && sup.working_hours_uz) || '09:00 - 19:00';
  const socials = (state.socialLinks || []).filter(s => s.is_active);

  const isOpen = state.supportWidgetOpen;

  return `
    <div class="floating-support-container ${isOpen ? 'open' : ''}">
      ${isOpen ? `
        <div class="support-popup-card">
          <div class="support-popup-header">
            <div class="support-popup-agent">
              <div class="support-avatar-wrap">
                <img src="/bird.png" alt="Humo Support" class="support-avatar-img">
                <span class="support-online-dot"></span>
              </div>
              <div>
                <div class="support-popup-name">${t('widget_support_title')}</div>
                <div class="support-popup-status">${t('widget_support_subtitle')}</div>
              </div>
            </div>
            <button class="support-popup-close" id="btn-close-support-widget" title="Yopish">
              ${ICONS.close}
            </button>
          </div>

          <div class="support-popup-body">
            <div class="support-working-badge">
              <span class="support-working-icon">${ICONS.clock}</span>
              <span><strong>${t('widget_working_hours')}:</strong> ${escapeHtml(workingHours)}</span>
            </div>

            <div class="support-channels-list">
              <!-- Telegram Support -->
              <a href="${escapeHtml(tgUrl)}" target="_blank" rel="noopener noreferrer" class="support-channel-btn tg">
                <span class="channel-icon">${ICONS.telegram}</span>
                <div class="channel-info">
                  <div class="channel-title">${t('widget_telegram_support')}</div>
                  <div class="channel-sub">@${escapeHtml(tg.replace('https://t.me/', '').replace('@', ''))}</div>
                </div>
                <span class="channel-arrow">${ICONS.arrowRight}</span>
              </a>

              <!-- WhatsApp Support -->
              <a href="${escapeHtml(waUrl)}" target="_blank" rel="noopener noreferrer" class="support-channel-btn wa">
                <span class="channel-icon">${ICONS.whatsapp}</span>
                <div class="channel-info">
                  <div class="channel-title">${t('widget_whatsapp_support')}</div>
                  <div class="channel-sub">WhatsApp Chat</div>
                </div>
                <span class="channel-arrow">${ICONS.arrowRight}</span>
              </a>

              <!-- Phone Call -->
              <a href="tel:${phone.replace(/\s+/g, '')}" class="support-channel-btn phone">
                <span class="channel-icon">${ICONS.phone}</span>
                <div class="channel-info">
                  <div class="channel-title">${t('widget_phone_call')}</div>
                  <div class="channel-sub">${escapeHtml(phone)}</div>
                </div>
                <span class="channel-arrow">${ICONS.arrowRight}</span>
              </a>

              <!-- Email Support -->
              <a href="mailto:${email}" class="support-channel-btn email">
                <span class="channel-icon">${ICONS.mail}</span>
                <div class="channel-info">
                  <div class="channel-title">${t('widget_email_support')}</div>
                  <div class="channel-sub">${escapeHtml(email)}</div>
                </div>
                <span class="channel-arrow">${ICONS.arrowRight}</span>
              </a>
            </div>

            <!-- Social Media Icons Row -->
            ${socials.length > 0 ? `
              <div class="support-socials-bar">
                <div class="support-socials-label">${t('footer_socials_title')}:</div>
                <div class="support-socials-icons">
                  ${socials.map(s => `
                    <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" 
                      class="support-soc-icon-link" 
                      style="color: ${getSocialColor(s.platform)};" 
                      title="${escapeHtml(s.title || s.platform)}">
                      ${getSocialIcon(s.platform, 20)}
                    </a>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}

      <!-- Floating Trigger Button -->
      <button class="support-floating-trigger ${isOpen ? 'active' : ''}" id="btn-toggle-support-widget" title="${t('widget_btn_support')}">
        <span class="support-trigger-icon">
          ${isOpen ? ICONS.close : ICONS.headset}
        </span>
        <span class="support-trigger-label">${isOpen ? t('btn_close') : t('widget_btn_support')}</span>
        <span class="support-trigger-ping"></span>
      </button>
    </div>
  `;
}

// Stage 3 & 4: Humo AI Dispatcher & Chat Translator
function formatAiMessageText(text) {
  if (!text) return '';
  const escaped = escapeHtml(text);
  let formatted = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  const lines = formatted.split('\n');
  let inList = false;
  let result = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
      if (!inList) {
        result.push('<ul style="margin: 6px 0; padding-left: 18px;">');
        inList = true;
      }
      result.push(`<li style="margin-bottom: 4px;">${trimmed.replace(/^[•-]\s*/, '')}</li>`);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      if (trimmed) {
        result.push(`<p style="margin: 0 0 6px 0;">${trimmed}</p>`);
      }
    }
  }
  if (inList) result.push('</ul>');
  return result.join('');
}

function renderAiDispatcherWidget() {
  const isOpen = state.aiDispatcherOpen;
  const messages = state.aiDispatcherMessages || [];
  const isLoading = state.aiDispatcherLoading;

  return `
    <div id="ai-dispatcher-container">
      ${isOpen ? `
        <div class="ai-dispatcher-popup" id="ai-dispatcher-popup">
          <div class="ai-dispatcher-header">
            <div class="ai-dispatcher-header-info">
              <div class="ai-dispatcher-avatar">
                ${ICONS.aiBot}
              </div>
              <div>
                <div class="ai-dispatcher-title">
                  <span>${t('ai_dispatcher_title')}</span>
                  <span class="ai-match-badge" style="font-size: 10px; padding: 1px 6px;">AI 2.5</span>
                </div>
                <div class="ai-dispatcher-subtitle">
                  <span class="status-dot-online"></span>
                  <span>${t('ai_dispatcher_online')}</span>
                </div>
              </div>
            </div>
            <div class="ai-dispatcher-header-actions">
              ${messages.length > 0 ? `
                <button type="button" class="ai-dispatcher-action-btn" id="btn-clear-ai-dispatcher" title="Tozalash">
                  ${ICONS.trash}
                </button>
              ` : ''}
              <button type="button" class="ai-dispatcher-action-btn" id="btn-minimize-ai-dispatcher" title="Kichraytirish">
                ${ICONS.minimize}
              </button>
              <button class="ai-dispatcher-close-btn" id="btn-close-ai-dispatcher" title="Yopish">&times;</button>
            </div>
          </div>

          <div class="ai-dispatcher-body" id="ai-dispatcher-body-scroll">
            ${messages.length === 0 ? `
              <div class="ai-msg bot">
                ${t('ai_dispatcher_welcome')}
              </div>

              <div class="ai-dispatcher-chips">
                <button type="button" class="ai-chip btn-ai-chip" data-question="${escapeHtml(t('ai_dispatcher_chip_cmr_tir'))}">
                  <span class="ai-chip-left">
                    <span class="ai-chip-icon">${ICONS.doc}</span>
                    <span>${t('ai_dispatcher_chip_cmr_tir')}</span>
                  </span>
                  <span class="ai-chip-arrow">${ICONS.arrowRightMini}</span>
                </button>
                <button type="button" class="ai-chip btn-ai-chip" data-question="${escapeHtml(t('ai_dispatcher_chip_dimensions'))}">
                  <span class="ai-chip-left">
                    <span class="ai-chip-icon">${ICONS.truck}</span>
                    <span>${t('ai_dispatcher_chip_dimensions')}</span>
                  </span>
                  <span class="ai-chip-arrow">${ICONS.arrowRightMini}</span>
                </button>
                <button type="button" class="ai-chip btn-ai-chip" data-question="${escapeHtml(t('ai_dispatcher_chip_intl_advice'))}">
                  <span class="ai-chip-left">
                    <span class="ai-chip-icon">${ICONS.globe}</span>
                    <span>${t('ai_dispatcher_chip_intl_advice')}</span>
                  </span>
                  <span class="ai-chip-arrow">${ICONS.arrowRightMini}</span>
                </button>
              </div>
            ` : messages.map(m => `
              <div class="ai-msg ${m.sender === 'user' ? 'user' : 'bot'}">
                ${formatAiMessageText(m.text)}
              </div>
            `).join('')}

            ${isLoading ? `
              <div class="ai-typing-indicator">
                <div class="ai-typing-dot"></div>
                <div class="ai-typing-dot"></div>
                <div class="ai-typing-dot"></div>
              </div>
            ` : ''}
          </div>

          <div class="ai-dispatcher-footer">
            <form id="form-ai-dispatcher" class="ai-dispatcher-input-form">
              <input type="text" class="ai-dispatcher-input" id="input-ai-dispatcher" 
                maxlength="500" 
                placeholder="${t('ai_dispatcher_placeholder')}" 
                autocomplete="off" 
                ${isLoading ? 'disabled' : ''} 
                required>
              <button type="submit" class="btn-ai-send" ${isLoading ? 'disabled' : ''} title="${t('ai_dispatcher_send')}">
                ${ICONS.send}
              </button>
            </form>
          </div>
        </div>
      ` : ''}

      <!-- Floating Trigger Button -->
      <button class="ai-dispatcher-fab" id="btn-toggle-ai-dispatcher" title="${t('ai_dispatcher_title')}">
        <span class="fab-pulse-dot"></span>
        <span class="fab-icon">${ICONS.aiBot}</span>
        <span class="fab-label">${t('ai_dispatcher_btn')}</span>
      </button>
    </div>
  `;
}

async function handleAiDispatcherSend(questionText) {
  const cleanQ = (questionText || '').trim();
  if (!cleanQ) return;

  if (!state.user) {
    navigate('#/auth');
    showToast(t('login_required_chat') || 'Iltimos, avval tizimga kiring', 'info');
    state.aiDispatcherOpen = false;
    render();
    return;
  }

  state.aiDispatcherMessages.push({
    sender: 'user',
    text: cleanQ,
    created_at: new Date().toISOString()
  });
  state.aiDispatcherLoading = true;
  render();

  setTimeout(() => {
    const scrollEl = document.getElementById('ai-dispatcher-body-scroll');
    if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
  }, 50);

  try {
    const res = await api('/api/ai/ask', {
      method: 'POST',
      body: JSON.stringify({
        question: cleanQ,
        lang: getLanguage()
      })
    });

    state.aiDispatcherMessages.push({
      sender: 'bot',
      text: res.answer || '',
      created_at: new Date().toISOString()
    });
  } catch (err) {
    state.aiDispatcherMessages.push({
      sender: 'bot',
      text: err.message || t('err_general'),
      created_at: new Date().toISOString()
    });
  } finally {
    state.aiDispatcherLoading = false;
    render();
    setTimeout(() => {
      const scrollEl = document.getElementById('ai-dispatcher-body-scroll');
      if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
      const inputEl = document.getElementById('input-ai-dispatcher');
      if (inputEl) inputEl.focus();
    }, 50);
  }
}

async function handleTranslateChatMessage(msgId, text) {
  if (!state.user) {
    navigate('#/auth');
    return;
  }
  state.translatedMessages = state.translatedMessages || {};

  try {
    const res = await api('/api/ai/translate', {
      method: 'POST',
      body: JSON.stringify({
        text,
        target_lang: getLanguage()
      })
    });

    if (res && res.translated_text) {
      state.translatedMessages[msgId] = {
        text: res.translated_text,
        target_lang: res.target_lang || getLanguage()
      };
      render();
    }
  } catch (err) {
    showToast(t('translation_error') || err.message, 'error');
  }
}

// 10. Auth Page View
function renderAuthPage() {
  const isRegister = state.routeParams.mode === 'register';

  return `
    <div style="max-width: 440px; margin: 40px auto;">
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="/bird.png" alt="Humo" style="width: 54px; height: 54px; object-fit: contain; margin-bottom: 8px;">
        <h2 style="font-size: 22px; font-weight: 800; color: #fff;">
          ${isRegister ? t('auth_title_register') : t('auth_title_login')}
        </h2>
        <p style="font-size: 13px; color: var(--text-muted);">Humo Logistics Marketplace</p>
      </div>

      <!-- Google OAuth Limitation Notice -->
      <div class="google-limitation-banner">
        <div style="color: var(--accent-primary); flex-shrink: 0; margin-top: 2px;">
          ${ICONS.shieldAlert}
        </div>
        <div>
          <strong>${t('google_auth_title')}</strong>
          <p>${t('google_auth_limitation')}</p>
        </div>
      </div>

      <div class="form-card">
        <form id="form-auth-submit">
          <div class="form-group">
            <label class="form-label">${t('auth_email')} *</label>
            <input type="email" class="form-input" id="auth-email" 
              placeholder="${t('auth_email_placeholder')}" required>
          </div>

          <div class="form-group" style="margin-top: 14px;">
            <label class="form-label">${t('auth_password')} *</label>
            <input type="password" class="form-input" id="auth-password" 
              placeholder="${t('auth_password_placeholder')}" required minlength="6">
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 20px;">
            ${isRegister ? t('btn_create_account') : t('btn_sign_in')}
          </button>
        </form>

        <div style="text-align: center; margin-top: 16px; font-size: 13px; color: var(--text-muted);">
          ${isRegister ? `
            ${t('auth_have_account')} 
            <a href="javascript:void(0)" id="switch-to-login" style="color: var(--accent-primary); font-weight: 600;">
              ${t('auth_link_login')}
            </a>
          ` : `
            ${t('auth_no_account')} 
            <a href="javascript:void(0)" id="switch-to-register" style="color: var(--accent-primary); font-weight: 600;">
              ${t('auth_link_register')}
            </a>
          `}
        </div>
      </div>
    </div>
  `;
}

// Modal Dialogs (Profile completion, edit listing)
function renderModal() {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return;

  if (!state.modal) {
    modalRoot.innerHTML = '';
    return;
  }

  if (state.modal.type === 'complete_profile') {
    modalRoot.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-dialog">
          <div class="modal-header">
            <div class="modal-title">${t('profile_title')}</div>
          </div>
          <form id="form-modal-complete-profile">
            <div class="modal-body">
              <div style="font-size: 13px; color: var(--accent-secondary); line-height: 1.5;">
                ${t('profile_required_notice')}
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">${t('profile_first_name')} *</label>
                  <input type="text" class="form-input" id="m-first-name" 
                    value="${escapeHtml(state.user ? state.user.first_name || '' : '')}" 
                    placeholder="${t('profile_first_name_placeholder')}" required>
                </div>
                <div class="form-group">
                  <label class="form-label">${t('profile_last_name')} *</label>
                  <input type="text" class="form-input" id="m-last-name" 
                    value="${escapeHtml(state.user ? state.user.last_name || '' : '')}" 
                    placeholder="${t('profile_last_name_placeholder')}" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">${t('profile_phone')} *</label>
                <input type="tel" class="form-input" id="m-phone" 
                  value="${escapeHtml(state.user && state.user.phone ? state.user.phone : '+998')}" 
                  placeholder="${t('profile_phone_placeholder')}" required>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                  ${t('profile_phone_hint')}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">${t('profile_role')} *</label>
                <select class="form-select" id="m-role" required>
                  <option value="">${t('profile_role_select')}</option>
                  ${state.metadata.business_roles.map(r => `
                    <option value="${r.id}" ${state.user && state.user.role === r.id ? 'selected' : ''}>
                      ${getLocalizedName(r)}
                    </option>
                  `).join('')}
                </select>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                  ${t('profile_role_hint')}
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="submit" class="btn btn-primary" ${state.profileFormSubmitting ? 'disabled' : ''}>
                ${state.profileFormSubmitting ? t('btn_saving') : t('btn_save_profile')}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('form-modal-complete-profile').addEventListener('submit', (e) => {
      e.preventDefault();
      const first_name = document.getElementById('m-first-name').value.trim();
      const last_name = document.getElementById('m-last-name').value.trim();
      const phone = document.getElementById('m-phone').value.trim();
      const role = document.getElementById('m-role').value;
      handleProfileSave({ first_name, last_name, phone, role });
    });
  } else if (state.modal.type === 'edit_listing') {
    const item = state.modal.data;
    const originCountryObj = state.metadata.locations.find(c => c.code === item.origin_country);
    const destCountryObj = state.metadata.locations.find(c => c.code === item.destination_country);

    modalRoot.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-dialog" style="max-width: 680px;">
          <div class="modal-header">
            <div class="modal-title">${t('edit_modal_title')}</div>
            <button class="modal-close-btn" id="btn-close-modal">&times;</button>
          </div>
          <form id="form-modal-edit-listing">
            <div class="modal-body">
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">${t('filter_origin')} (${t('filter_country')}) *</label>
                  <select class="form-select" id="edit-origin-country" required>
                    ${state.metadata.locations.map(c => `
                      <option value="${c.code}" ${c.code === item.origin_country ? 'selected' : ''}>
                        ${getLocalizedName(c)}
                      </option>
                    `).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">${t('filter_origin')} (${t('filter_locality')}) *</label>
                  <select class="form-select" id="edit-origin-locality" required>
                    ${originCountryObj ? originCountryObj.localities.map(l => `
                      <option value="${l.id}" ${l.id === item.origin_locality ? 'selected' : ''}>
                        ${getLocalizedName(l)}
                      </option>
                    `).join('') : ''}
                    <option value="__custom__" ${item.origin_custom ? 'selected' : ''}>
                      ✦ ${t('filter_custom_locality_label')}
                    </option>
                  </select>
                </div>
              </div>

              ${item.origin_custom ? `
                <div class="form-group" style="margin-top: 10px;">
                  <label class="form-label">${t('filter_manual_locality_placeholder')} *</label>
                  <input type="text" class="form-input" id="edit-origin-custom" 
                    value="${escapeHtml(item.origin_locality)}" required>
                </div>
              ` : ''}

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">${t('filter_destination')} (${t('filter_country')}) *</label>
                  <select class="form-select" id="edit-dest-country" required>
                    ${state.metadata.locations.map(c => `
                      <option value="${c.code}" ${c.code === item.destination_country ? 'selected' : ''}>
                        ${getLocalizedName(c)}
                      </option>
                    `).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">${t('filter_destination')} (${t('filter_locality')}) *</label>
                  <select class="form-select" id="edit-dest-locality" required>
                    ${destCountryObj ? destCountryObj.localities.map(l => `
                      <option value="${l.id}" ${l.id === item.destination_locality ? 'selected' : ''}>
                        ${getLocalizedName(l)}
                      </option>
                    `).join('') : ''}
                    <option value="__custom__" ${item.destination_custom ? 'selected' : ''}>
                      ✦ ${t('filter_custom_locality_label')}
                    </option>
                  </select>
                </div>
              </div>

              ${item.destination_custom ? `
                <div class="form-group" style="margin-top: 10px;">
                  <label class="form-label">${t('filter_manual_locality_placeholder')} *</label>
                  <input type="text" class="form-input" id="edit-dest-custom" 
                    value="${escapeHtml(item.destination_locality)}" required>
                </div>
              ` : ''}

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">${t('form_cargo_name')} *</label>
                  <input type="text" class="form-input" id="edit-cargo-name" 
                    value="${escapeHtml(item.cargo_name)}" required>
                </div>
                <div class="form-group">
                  <label class="form-label">${t('form_body_type')} *</label>
                  <select class="form-select" id="edit-body-type" required>
                    ${state.metadata.body_types.map(b => `
                      <option value="${b.id}" ${b.id === item.body_type ? 'selected' : ''}>
                        ${getLocalizedName(b)}
                      </option>
                    `).join('')}
                  </select>
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">${t('form_weight')} *</label>
                  <input type="number" step="0.1" class="form-input" id="edit-weight" 
                    value="${item.weight}" required>
                </div>
                <div class="form-group">
                  <label class="form-label">${t('form_volume')}</label>
                  <input type="number" step="0.1" class="form-input" id="edit-volume" 
                    value="${item.volume || ''}">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">${t('form_description')}</label>
                <textarea class="form-textarea" id="edit-description" rows="2">${escapeHtml(item.cargo_description || '')}</textarea>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">${t('form_price_type')}</label>
                  <select class="form-select" id="edit-price-type">
                    <option value="negotiable" ${item.price_type === 'negotiable' ? 'selected' : ''}>${t('form_price_negotiable')}</option>
                    <option value="fixed" ${item.price_type === 'fixed' ? 'selected' : ''}>${t('form_price_fixed')}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">${t('form_price_amount')}</label>
                  <input type="number" step="1" class="form-input" id="edit-price-amount" 
                    value="${item.price_amount || ''}" placeholder="Narx">
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" id="btn-cancel-modal">
                ${t('btn_cancel')}
              </button>
              <button type="submit" class="btn btn-primary">
                ${t('btn_save_changes')}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('btn-close-modal').addEventListener('click', () => {
      state.modal = null;
      renderModal();
    });
    document.getElementById('btn-cancel-modal').addEventListener('click', () => {
      state.modal = null;
      renderModal();
    });

    document.getElementById('form-modal-edit-listing').addEventListener('submit', (e) => {
      e.preventDefault();
      const origin_country = document.getElementById('edit-origin-country').value;
      const originLocalitySelect = document.getElementById('edit-origin-locality').value;
      const isOriginCustom = originLocalitySelect === '__custom__';
      const origin_locality = isOriginCustom ? document.getElementById('edit-origin-custom').value.trim() : originLocalitySelect;

      const destination_country = document.getElementById('edit-dest-country').value;
      const destLocalitySelect = document.getElementById('edit-dest-locality').value;
      const isDestCustom = destLocalitySelect === '__custom__';
      const destination_locality = isDestCustom ? document.getElementById('edit-dest-custom').value.trim() : destLocalitySelect;

      const cargo_name = document.getElementById('edit-cargo-name').value.trim();
      const body_type = document.getElementById('edit-body-type').value;
      const weight = parseFloat(document.getElementById('edit-weight').value);
      const volume = document.getElementById('edit-volume').value;
      const cargo_description = document.getElementById('edit-description').value.trim();
      const price_type = document.getElementById('edit-price-type').value;
      const price_amount = document.getElementById('edit-price-amount').value;

      handleListingEditSave(item.id, {
        origin_country,
        origin_locality,
        origin_custom: isOriginCustom ? 1 : 0,
        destination_country,
        destination_locality,
        destination_custom: isDestCustom ? 1 : 0,
        cargo_name,
        body_type,
        weight,
        volume: volume !== '' ? parseFloat(volume) : null,
        cargo_description,
        loading_date_type: item.loading_date_type || 'ready_now',
        loading_date: item.loading_date,
        price_type,
        price_amount: price_type === 'fixed' && price_amount !== '' ? parseFloat(price_amount) : null,
        price_currency: item.price_currency || 'USD'
      });
    });
  } else if (state.modal.type === 'payment_request') {
    const plan = state.modal.plan;
    const planName = getLocalizedPlanName(plan) || plan.name_uz;
    const settings = state.paymentSettings || {};
    const lang = getLanguage();
    const currentInst = lang === 'ru' 
      ? (settings.instructions_ru || settings.instructions_uz || '') 
      : lang === 'en' 
        ? (settings.instructions_en || settings.instructions_uz || '') 
        : (settings.instructions_uz || 'Click, Payme yoki bank ilovasi orqali to‘lov qiling va quyida chek raqami yoki to‘lovchi ismini qoldiring.');

    modalRoot.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-dialog" style="max-width: 520px;">
          <div class="modal-header">
            <div class="modal-title">💳 ${t('modal_payment_title')}</div>
            <button class="modal-close-btn" id="btn-close-modal">&times;</button>
          </div>
          <form id="form-modal-payment-request">
            <div class="modal-body">
              <div style="background: var(--surface-bg-alt); border: 1px solid var(--surface-border); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
                <div style="font-size: 13px; color: var(--text-muted);">${t('plan_selected')}:</div>
                <div style="font-size: 18px; font-weight: 800; color: #fff; margin-top: 2px;">
                  ${escapeHtml(planName)} — <span style="color: var(--accent-secondary);">${formatUzs(plan.price_uzs)} UZS</span>
                </div>
                <div style="font-size: 12px; color: var(--text-dim); margin-top: 2px;">
                  ${t('admin_sub_col_duration')}: ${plan.duration_days} ${t('days_unit')} • ${plan.contact_limit === -1 ? t('feature_unlimited_contacts') : `${plan.contact_limit} ${t('contacts_unit')}`}
                </div>
              </div>

              <div style="background: rgba(255, 122, 0, 0.08); border: 1px dashed rgba(255, 122, 0, 0.3); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="font-size: 12px; font-weight: 700; color: var(--accent-primary); text-transform: uppercase;">
                    🏦 ${t('bank_transfer_details')}
                  </div>
                  <button type="button" class="btn btn-outline btn-xs" id="btn-copy-card-num" style="padding: 2px 8px; font-size: 11px;">
                    📋 ${t('copy_card_number')}
                  </button>
                </div>
                <div style="font-size: 17px; font-weight: 800; color: #fff; margin: 8px 0 4px; font-family: monospace; letter-spacing: 1.5px;">
                  ${escapeHtml(settings.card_number || '9860 0301 4455 8899')}
                </div>
                <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">
                  ${escapeHtml(settings.card_holder || 'Humo Logistics MCHJ')} ${settings.card_bank ? `• ${escapeHtml(settings.card_bank)}` : ''}
                </div>
                <div style="font-size: 11px; color: var(--text-dim); margin-top: 6px; line-height: 1.4;">
                  ${escapeHtml(currentInst)}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">${t('payment_receipt_note')} *</label>
                <textarea class="form-textarea" id="payment-receipt-note" rows="3" 
                  placeholder="${t('payment_receipt_placeholder')}" required></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" id="btn-cancel-modal">
                ${t('btn_cancel')}
              </button>
              <button type="submit" class="btn btn-primary">
                ${t('btn_send_payment_request')}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('btn-close-modal').addEventListener('click', () => {
      state.modal = null;
      renderModal();
    });
    document.getElementById('btn-cancel-modal').addEventListener('click', () => {
      state.modal = null;
      renderModal();
    });

    const btnCopyCard = document.getElementById('btn-copy-card-num');
    if (btnCopyCard) {
      btnCopyCard.addEventListener('click', () => {
        const rawCard = (settings.card_number || '').replace(/\s+/g, '');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(rawCard);
        }
        showToast(t('copied_to_clipboard'), 'success');
      });
    }

    document.getElementById('form-modal-payment-request').addEventListener('submit', (e) => {
      e.preventDefault();
      const note = document.getElementById('payment-receipt-note').value.trim();
      if (!note) return;
      handleSubmitSubscriptionRequest(plan.id, note);
    });
  } else if (state.modal.type === 'limit_exhausted') {
    modalRoot.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-dialog" style="max-width: 480px; text-align: center;">
          <div class="modal-header" style="justify-content: center; border-bottom: none; padding-bottom: 0;">
            <div style="font-size: 40px; margin-bottom: 8px;">⏳</div>
          </div>
          <div class="modal-body" style="padding-top: 0;">
            <h2 style="font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 8px;">
              ${t('limit_exhausted_title')}
            </h2>
            <p style="font-size: 14px; color: var(--text-muted); line-height: 1.5; margin-bottom: 20px;">
              ${t('limit_exhausted_desc')}
            </p>
            <div style="display: flex; gap: 10px; justify-content: center;">
              <button class="btn btn-outline" id="btn-close-limit-modal">
                ${t('btn_close')}
              </button>
              <a href="#/pricing" class="btn btn-primary" id="btn-goto-pricing">
                ${t('btn_view_pricing_plans')} →
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-close-limit-modal').addEventListener('click', () => {
      state.modal = null;
      renderModal();
    });
    const gotoPricingBtn = document.getElementById('btn-goto-pricing');
    if (gotoPricingBtn) {
      gotoPricingBtn.addEventListener('click', () => {
        state.modal = null;
        renderModal();
      });
    }
  } else if (state.modal.type === 'admin_add_plan') {
    modalRoot.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-dialog" style="max-width: 580px;">
          <div class="modal-header">
            <div class="modal-title">+ ${t('btn_add_plan')}</div>
            <button class="modal-close-btn" id="btn-close-modal">&times;</button>
          </div>
          <form id="form-admin-add-plan">
            <div class="modal-body">
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Tarif nomi (O‘zb) *</label>
                  <input type="text" class="form-input" id="plan-name-uz" placeholder="Masalan: Pro Dispetcher" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Tarif nomi (Рус)</label>
                  <input type="text" class="form-input" id="plan-name-ru" placeholder="Про Диспетчер">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Tavsif (O‘zb)</label>
                <input type="text" class="form-input" id="plan-desc-uz" placeholder="Cheksiz kontaktlar va qo‘shimcha imkoniyatlar">
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Narxi (UZS) *</label>
                  <input type="number" min="0" step="1000" class="form-input" id="plan-price" placeholder="149000" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Muddati (Kun) *</label>
                  <input type="number" min="1" step="1" class="form-input" id="plan-duration" value="30" required>
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Kontaktlar limiti (-1 = cheksiz) *</label>
                  <input type="number" min="-1" step="1" class="form-input" id="plan-limit" value="-1" required>
                </div>
                <div class="form-group" style="display: flex; align-items: center; gap: 8px; margin-top: 24px;">
                  <input type="checkbox" id="plan-is-popular" style="width: 18px; height: 18px;">
                  <label for="plan-is-popular" style="font-size: 13px; color: #fff; cursor: pointer;">Eng ommabop belgisi (Popular)</label>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" id="btn-cancel-modal">
                ${t('btn_cancel')}
              </button>
              <button type="submit" class="btn btn-primary">
                ${t('btn_save_changes')}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('btn-close-modal').addEventListener('click', () => {
      state.modal = null;
      renderModal();
    });
    document.getElementById('btn-cancel-modal').addEventListener('click', () => {
      state.modal = null;
      renderModal();
    });

    document.getElementById('form-admin-add-plan').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const body = {
          name_uz: document.getElementById('plan-name-uz').value.trim(),
          name_ru: document.getElementById('plan-name-ru').value.trim() || document.getElementById('plan-name-uz').value.trim(),
          name_en: document.getElementById('plan-name-uz').value.trim(),
          description_uz: document.getElementById('plan-desc-uz').value.trim(),
          price_uzs: parseInt(document.getElementById('plan-price').value, 10),
          duration_days: parseInt(document.getElementById('plan-duration').value, 10),
          contact_limit: parseInt(document.getElementById('plan-limit').value, 10),
          is_popular: document.getElementById('plan-is-popular').checked
        };
        await api('/api/admin/plans', {
          method: 'POST',
          body: JSON.stringify(body)
        });
        showToast('Yangi tarif yaratildi', 'success');
        state.modal = null;
        await loadAdminSubData();
        render();
      } catch (err) {
        showToast(err.message || t('err_general'), 'error');
      }
    });
  } else if (state.modal.type === 'admin_grant_user_sub') {
    const u = state.modal.user;
    modalRoot.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-dialog" style="max-width: 480px;">
          <div class="modal-header">
            <div class="modal-title">💳 ${t('btn_grant_plan')}</div>
            <button class="modal-close-btn" id="btn-close-modal">&times;</button>
          </div>
          <form id="form-admin-grant-sub">
            <div class="modal-body">
              <div style="font-size: 14px; color: #fff; margin-bottom: 12px;">
                ${t('user_col_name')}: <strong>${escapeHtml(u.name || u.id)}</strong>
              </div>

              <div class="form-group">
                <label class="form-label">${t('admin_sub_col_plan')} *</label>
                <select class="form-select" id="grant-plan-id" required>
                  ${(state.adminPlans || []).filter(p => p.price_uzs > 0).map(p => `
                    <option value="${p.id}">${escapeHtml(getLocalizedPlanName(p))} (${formatUzs(p.price_uzs)} UZS / ${p.duration_days} ${t('days_unit')})</option>
                  `).join('')}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">${t('admin_sub_col_duration')} (${t('days_unit')}) *</label>
                <input type="number" min="1" step="1" class="form-input" id="grant-plan-days" value="30" required>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" id="btn-cancel-modal">
                ${t('btn_cancel')}
              </button>
              <button type="submit" class="btn btn-primary">
                ${t('btn_grant_plan')}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('btn-close-modal').addEventListener('click', () => {
      state.modal = null;
      renderModal();
    });
    document.getElementById('btn-cancel-modal').addEventListener('click', () => {
      state.modal = null;
      renderModal();
    });

    document.getElementById('form-admin-grant-sub').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const plan_id = parseInt(document.getElementById('grant-plan-id').value, 10);
        const plan_duration_days = parseInt(document.getElementById('grant-plan-days').value, 10);
        await api(`/api/admin/users/${u.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ plan_id, plan_duration_days })
        });
        showToast('Foydalanuvchiga obuna berildi', 'success');
        state.modal = null;
        await loadAdminUsers();
        await loadAdminStats();
        render();
      } catch (err) {
        showToast(err.message || t('err_general'), 'error');
      }
    });
  } else if (state.modal.type === 'admin_add_social') {
    modalRoot.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-dialog" style="max-width: 520px;">
          <div class="modal-header">
            <div class="modal-title">+ ${t('modal_add_social_title')}</div>
            <button class="modal-close-btn" id="btn-close-modal">&times;</button>
          </div>
          <form id="form-admin-add-social">
            <div class="modal-body">
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">${t('label_social_platform')} *</label>
                  <select class="form-select" id="soc-platform" required>
                    <option value="telegram">Telegram</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="youtube">YouTube</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="tiktok">TikTok</option>
                    <option value="other">Boshqa / Veb-sayt</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">${t('label_social_title')} *</label>
                  <input type="text" class="form-input" id="soc-title" placeholder="Masalan: Telegram Kanal" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">${t('label_social_url')} *</label>
                <input type="url" class="form-input" id="soc-url" placeholder="https://t.me/..." required>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">${t('label_social_sort')}</label>
                  <input type="number" class="form-input" id="soc-sort" value="1" min="0" step="1">
                </div>
                <div class="form-group" style="display: flex; align-items: center; gap: 8px; margin-top: 26px;">
                  <input type="checkbox" id="soc-active" checked style="width: 18px; height: 18px; accent-color: var(--accent-primary);">
                  <label for="soc-active" style="font-size: 13px; color: #fff; cursor: pointer;">${t('label_social_active')}</label>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" id="btn-cancel-modal">
                ${t('btn_cancel')}
              </button>
              <button type="submit" class="btn btn-primary">
                ${t('btn_save_changes')}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('btn-close-modal').addEventListener('click', () => {
      state.modal = null;
      renderModal();
    });
    document.getElementById('btn-cancel-modal').addEventListener('click', () => {
      state.modal = null;
      renderModal();
    });

    document.getElementById('form-admin-add-social').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const body = {
          platform: document.getElementById('soc-platform').value,
          title: document.getElementById('soc-title').value.trim(),
          url: document.getElementById('soc-url').value.trim(),
          sort_order: parseInt(document.getElementById('soc-sort').value, 10) || 0,
          is_active: document.getElementById('soc-active').checked
        };
        await api('/api/admin/support/socials', {
          method: 'POST',
          body: JSON.stringify(body)
        });
        showToast(t('social_created_success'), 'success');
        state.modal = null;
        await loadAdminSupportData();
        render();
      } catch (err) {
        showToast(err.message || t('err_general'), 'error');
      }
    });
  } else if (state.modal.type === 'admin_edit_social') {
    const s = state.modal.social;
    modalRoot.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-dialog" style="max-width: 520px;">
          <div class="modal-header">
            <div class="modal-title">✏️ ${t('modal_edit_social_title')}</div>
            <button class="modal-close-btn" id="btn-close-modal">&times;</button>
          </div>
          <form id="form-admin-edit-social">
            <div class="modal-body">
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">${t('label_social_platform')} *</label>
                  <select class="form-select" id="soc-edit-platform" required>
                    <option value="telegram" ${s.platform === 'telegram' ? 'selected' : ''}>Telegram</option>
                    <option value="whatsapp" ${s.platform === 'whatsapp' ? 'selected' : ''}>WhatsApp</option>
                    <option value="instagram" ${s.platform === 'instagram' ? 'selected' : ''}>Instagram</option>
                    <option value="facebook" ${s.platform === 'facebook' ? 'selected' : ''}>Facebook</option>
                    <option value="youtube" ${s.platform === 'youtube' ? 'selected' : ''}>YouTube</option>
                    <option value="linkedin" ${s.platform === 'linkedin' ? 'selected' : ''}>LinkedIn</option>
                    <option value="tiktok" ${s.platform === 'tiktok' ? 'selected' : ''}>TikTok</option>
                    <option value="other" ${s.platform === 'other' ? 'selected' : ''}>Boshqa / Veb-sayt</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">${t('label_social_title')} *</label>
                  <input type="text" class="form-input" id="soc-edit-title" value="${escapeHtml(s.title || '')}" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">${t('label_social_url')} *</label>
                <input type="url" class="form-input" id="soc-edit-url" value="${escapeHtml(s.url || '')}" required>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">${t('label_social_sort')}</label>
                  <input type="number" class="form-input" id="soc-edit-sort" value="${s.sort_order ?? 0}" min="0" step="1">
                </div>
                <div class="form-group" style="display: flex; align-items: center; gap: 8px; margin-top: 26px;">
                  <input type="checkbox" id="soc-edit-active" ${s.is_active ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--accent-primary);">
                  <label for="soc-edit-active" style="font-size: 13px; color: #fff; cursor: pointer;">${t('label_social_active')}</label>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" id="btn-cancel-modal">
                ${t('btn_cancel')}
              </button>
              <button type="submit" class="btn btn-primary">
                ${t('btn_save_changes')}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('btn-close-modal').addEventListener('click', () => {
      state.modal = null;
      renderModal();
    });
    document.getElementById('btn-cancel-modal').addEventListener('click', () => {
      state.modal = null;
      renderModal();
    });

    document.getElementById('form-admin-edit-social').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const body = {
          platform: document.getElementById('soc-edit-platform').value,
          title: document.getElementById('soc-edit-title').value.trim(),
          url: document.getElementById('soc-edit-url').value.trim(),
          sort_order: parseInt(document.getElementById('soc-edit-sort').value, 10) || 0,
          is_active: document.getElementById('soc-edit-active').checked
        };
        await api(`/api/admin/support/socials/${s.id}`, {
          method: 'PUT',
          body: JSON.stringify(body)
        });
        showToast(t('social_updated_success'), 'success');
        state.modal = null;
        await loadAdminSupportData();
        render();
      } catch (err) {
        showToast(err.message || t('err_general'), 'error');
      }
    });
  } else if (state.modal.type === 'ios_install') {
    modalRoot.innerHTML = `
      <div class="modal-overlay" id="modal-overlay-ios-install">
        <div class="modal-dialog ios-pwa-modal-dialog" style="max-width: 440px; text-align: center;">
          <div class="modal-header" style="justify-content: flex-end; padding-bottom: 0; border-bottom: none;">
            <button type="button" class="btn-close-modal" id="btn-close-ios-modal" style="background: none; border: none; color: var(--text-muted); font-size: 18px; cursor: pointer;">✕</button>
          </div>
          <div class="modal-body" style="padding-top: 0;">
            <div style="display: flex; justify-content: center; margin-bottom: 12px;">
              <img src="/icons/icon-192.png" alt="Humo Logistics" style="width: 64px; height: 64px; border-radius: 16px; box-shadow: 0 4px 20px rgba(249, 115, 22, 0.35); border: 2px solid rgba(249, 115, 22, 0.5);">
            </div>
            <h3 style="font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 8px;">
              ${t('pwa_ios_guide_title')}
            </h3>
            <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 20px;">
              ${t('pwa_install_desc')}
            </p>

            <div class="ios-install-steps" style="display: flex; flex-direction: column; gap: 12px; text-align: left; background: var(--surface-bg-alt); padding: 16px; border-radius: 12px; border: 1px solid var(--surface-border-subtle); margin-bottom: 20px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 28px; height: 28px; border-radius: 8px; background: rgba(249, 115, 22, 0.15); color: var(--accent-primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; flex-shrink: 0;">1</div>
                <div style="font-size: 13px; color: #e5e5e5; line-height: 1.4;">
                  ${t('pwa_ios_guide_step1')}
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 28px; height: 28px; border-radius: 8px; background: rgba(249, 115, 22, 0.15); color: var(--accent-primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; flex-shrink: 0;">2</div>
                <div style="font-size: 13px; color: #e5e5e5; line-height: 1.4;">
                  ${t('pwa_ios_guide_step2')}
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 28px; height: 28px; border-radius: 8px; background: rgba(249, 115, 22, 0.15); color: var(--accent-primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; flex-shrink: 0;">3</div>
                <div style="font-size: 13px; color: #e5e5e5; line-height: 1.4;">
                  ${t('pwa_ios_guide_step3')}
                </div>
              </div>
            </div>

            <button type="button" class="btn btn-primary" id="btn-ios-got-it" style="width: 100%; justify-content: center;">
              Tushundim
            </button>
          </div>
        </div>
      </div>
    `;

    const closeBtn = document.getElementById('btn-close-ios-modal');
    const gotItBtn = document.getElementById('btn-ios-got-it');
    const overlay = document.getElementById('modal-overlay-ios-install');
    const closeModal = () => {
      state.modal = null;
      renderModal();
    };
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (gotItBtn) gotItBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  } else if (state.modal.type === 'ai_match') {
    const isCargoTarget = state.modal.listingType === 'cargo';
    const target = state.modal.target;
    const matches = state.modal.matches || [];
    const isLoading = state.modal.loading;
    const error = state.modal.error;

    let targetSummaryHtml = '';
    if (target) {
      const originLoc = getLocalityLabel(target.origin_country, target.origin_locality, target.origin_custom);
      const destLoc = getLocalityLabel(target.destination_country, target.destination_locality, target.destination_custom);
      const originC = getCountryLabel(target.origin_country);
      const destC = getCountryLabel(target.destination_country);
      const targetSub = isCargoTarget
        ? `${escapeHtml(target.cargo_name || '')} • ${target.weight} ${t('weight_unit')} • ${getBodyTypeLabel(target.body_type)}`
        : `${escapeHtml(target.truck_model || '')} • ${target.max_weight} ${t('weight_unit')} • ${getBodyTypeLabel(target.body_type)}`;

      targetSummaryHtml = `
        <div class="ai-target-summary-box">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: var(--accent-primary); font-weight: 700; margin-bottom: 2px; display: flex; align-items: center; gap: 6px;">
              <span class="ai-target-icon">${ICONS.target}</span>
              <span>${t('ai_match_target_label')} (${isCargoTarget ? t('filter_type_cargo') : t('filter_type_transport')})</span>
            </div>
            <div style="font-size: 13.5px; font-weight: 700; color: #fff;">
              ${originLoc} (${originC}) → ${destLoc} (${destC})
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
              ${targetSub}
            </div>
          </div>
          <span class="ai-match-badge">AI 2.5</span>
        </div>
      `;
    }

    modalRoot.innerHTML = `
      <div class="modal-overlay" id="modal-overlay-ai-match">
        <div class="modal-dialog ai-matches-modal-dialog">
          <div class="modal-header">
            <div>
              <div class="modal-title" style="display: flex; align-items: center; gap: 8px;">
                <span class="modal-title-icon">${ICONS.radar}</span>
                <span>${isCargoTarget ? t('ai_matches_modal_title_cargo') : t('ai_matches_modal_title_truck')}</span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                ${t('ai_matches_subtitle')}
              </div>
            </div>
            <button class="modal-close-btn" id="btn-close-modal">&times;</button>
          </div>

          <div class="modal-body" style="max-height: calc(90vh - 140px); overflow-y: auto; padding: 16px;">
            ${targetSummaryHtml}

            ${isLoading ? `
              <div style="text-align: center; padding: 48px 16px; color: var(--text-muted);">
                <div class="spinner" style="margin: 0 auto 16px; width: 36px; height: 36px; border-width: 3px;"></div>
                <div style="font-size: 15px; font-weight: 600; color: #fff;">${t('ai_matching_in_progress')}</div>
              </div>
            ` : error ? `
              <div class="ai-matches-empty">
                <div class="ai-empty-icon" style="margin-bottom: 8px;">${ICONS.warning}</div>
                <div style="color: #ef4444; font-weight: 600;">${escapeHtml(error)}</div>
              </div>
            ` : matches.length === 0 ? `
              <div class="ai-matches-empty">
                <div class="ai-empty-icon" style="margin-bottom: 8px;">${ICONS.searchLarge}</div>
                <div style="font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 4px;">${t('ai_matches_empty')}</div>
              </div>
            ` : `
              <div class="ai-matches-list">
                ${matches.map(m => {
                  const mOriginLoc = getLocalityLabel(m.origin_country, m.origin_locality, m.origin_custom);
                  const mDestLoc = getLocalityLabel(m.destination_country, m.destination_locality, m.destination_custom);
                  const mOriginC = getCountryLabel(m.origin_country);
                  const mDestC = getCountryLabel(m.destination_country);
                  const isMatchHigh = (m.match_score || 0) >= 85;
                  const isOwner = state.user && state.user.id === m.user_id;
                  const candidateType = isCargoTarget ? 'transport' : 'cargo';

                  return `
                    <div class="ai-match-card">
                      <div class="ai-match-card-top">
                        <div class="cargo-route" style="font-size: 13.5px; font-weight: 700; color: #fff;">
                          <span>${mOriginLoc} (${mOriginC})</span>
                          <span class="route-arrow" style="color: var(--accent-primary); margin: 0 4px;">${ICONS.arrowRight}</span>
                          <span>${mDestLoc} (${mDestC})</span>
                        </div>
                        <div class="ai-match-score-pill ${isMatchHigh ? 'high' : ''}">
                          ${ICONS.aiSparkle} <span>${m.match_score || 70}% ${t('ai_match_score')}</span>
                        </div>
                      </div>

                      <div class="ai-match-reason-box">
                        <span class="ai-reason-icon">${ICONS.bulb}</span>
                        <span>${escapeHtml(m.match_reason || '')}</span>
                      </div>
                        <span>${escapeHtml(m.match_reason || '')}</span>
                      </div>

                      <div class="cargo-specs-tags" style="margin-bottom: 12px;">
                        ${isCargoTarget ? `
                          ${m.truck_model ? `<span class="spec-tag" style="background: rgba(255, 255, 255, 0.05); color: #fff;"><strong>${escapeHtml(m.truck_model)}</strong></span>` : ''}
                          <span class="spec-tag"><strong>${m.max_weight}</strong> ${t('weight_unit')}</span>
                          ${m.max_volume ? `<span class="spec-tag"><strong>${m.max_volume}</strong> ${t('volume_unit')}</span>` : ''}
                          <span class="spec-tag">${getBodyTypeLabel(m.body_type)}</span>
                          <span class="spec-tag" style="color: var(--accent-secondary);">
                            ${m.loading_date_type === 'ready_now' ? t('ready_to_load') : `${t('loading_date_prefix')} ${formatDate(m.loading_date)}`}
                          </span>
                        ` : `
                          <span class="spec-tag" style="background: rgba(255, 255, 255, 0.05); color: #fff;"><strong>${escapeHtml(m.cargo_name || '')}</strong></span>
                          <span class="spec-tag"><strong>${m.weight}</strong> ${t('weight_unit')}</span>
                          ${m.volume ? `<span class="spec-tag"><strong>${m.volume}</strong> ${t('volume_unit')}</span>` : ''}
                          <span class="spec-tag">${getBodyTypeLabel(m.body_type)}</span>
                          <span class="spec-tag" style="color: var(--accent-secondary); font-weight: 700;">
                            ${formatPrice(m)}
                          </span>
                        `}
                      </div>

                      <div class="ai-match-card-footer">
                        <div style="font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
                          <span>${escapeHtml(m.first_name || '')} ${escapeHtml(m.last_name || '')}</span>
                          ${m.is_verified ? `<span class="verified-badge" title="${t('badge_verified')}">✓</span>` : ''}
                        </div>

                        <div style="display: flex; gap: 8px; align-items: center;">
                          ${!isOwner ? `
                            <button class="btn btn-chat-action btn-sm btn-modal-ai-chat" data-type="${candidateType}" data-id="${m.id}" data-owner="${m.user_id}">
                              ${ICONS.chat}
                              <span>${t('btn_message_owner')}</span>
                            </button>
                          ` : ''}

                          ${m.phone ? `
                            ${m.is_phone_unlocked ? `
                              <a href="tel:${escapeHtml(m.phone)}" class="btn-phone" title="${t('call_contact')}" style="padding: 6px 12px; font-size: 12px;">
                                ${ICONS.phone}
                                <span>${escapeHtml(m.phone)}</span>
                              </a>
                            ` : `
                              <button class="btn btn-phone btn-modal-ai-unlock" data-type="${candidateType}" data-id="${m.id}" style="padding: 6px 12px; font-size: 12px;">
                                ${ICONS.phone}
                                <span>${escapeHtml(m.phone)}</span>
                                <span class="unlock-badge-pill">${t('btn_reveal_phone')}</span>
                              </button>
                            `}
                          ` : ''}
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" id="btn-close-modal-bottom">
              ${t('btn_close')}
            </button>
          </div>
        </div>
      </div>
    `;

    const closeModal = () => {
      state.modal = null;
      renderModal();
    };

    const btnClose = document.getElementById('btn-close-modal');
    if (btnClose) btnClose.addEventListener('click', closeModal);
    const btnCloseBottom = document.getElementById('btn-close-modal-bottom');
    if (btnCloseBottom) btnCloseBottom.addEventListener('click', closeModal);
    const overlay = document.getElementById('modal-overlay-ai-match');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
      });
    }

    modalRoot.querySelectorAll('.btn-modal-ai-chat').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = e.currentTarget.getAttribute('data-type');
        const id = e.currentTarget.getAttribute('data-id');
        const ownerId = e.currentTarget.getAttribute('data-owner');
        state.modal = null;
        renderModal();
        startChatFromListing(type, id, ownerId);
      });
    });

    modalRoot.querySelectorAll('.btn-modal-ai-unlock').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const type = e.currentTarget.getAttribute('data-type');
        const id = e.currentTarget.getAttribute('data-id');
        await handleUnlockContact(type, id);
        if (state.modal && state.modal.type === 'ai_match') {
          const matchItem = state.modal.matches.find(item => item.id == id);
          if (matchItem) {
            matchItem.is_phone_unlocked = true;
            renderModal();
          }
        }
      });
    });
  }
}

// Event Bindings
function bindEvents() {
  // Language Switcher
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const lang = e.currentTarget.getAttribute('data-lang');
      setLanguage(lang);
      render();
    });
  });

  // Logout Sidebar Button
  const btnLogout = document.getElementById('btn-logout-sidebar');
  if (btnLogout) {
    btnLogout.addEventListener('click', handleLogout);
  }

  // Complete Profile Button in notice
  const btnCompleteProfile = document.getElementById('btn-open-complete-profile');
  if (btnCompleteProfile) {
    btnCompleteProfile.addEventListener('click', () => {
      state.modal = { type: 'complete_profile' };
      renderModal();
    });
  }

  // Home Page Tabs Toggle
  const homeToggleCargo = document.getElementById('home-toggle-cargo');
  if (homeToggleCargo) {
    homeToggleCargo.addEventListener('click', () => {
      state.homeTab = 'cargo';
      render();
      loadPublicListings();
    });
  }

  const homeToggleTrucks = document.getElementById('home-toggle-trucks');
  if (homeToggleTrucks) {
    homeToggleTrucks.addEventListener('click', () => {
      state.homeTab = 'trucks';
      render();
      loadPublicTransports();
    });
  }

  // My Listings Tabs Toggle
  const myToggleCargo = document.getElementById('my-toggle-cargo');
  if (myToggleCargo) {
    myToggleCargo.addEventListener('click', () => {
      state.myListingsTab = 'cargo';
      render();
    });
  }

  const myToggleTrucks = document.getElementById('my-toggle-trucks');
  if (myToggleTrucks) {
    myToggleTrucks.addEventListener('click', () => {
      state.myListingsTab = 'trucks';
      render();
      loadMyTransports();
    });
  }

  // Cargo Search Filters
  const originCountrySelect = document.getElementById('search-origin-country');
  if (originCountrySelect) {
    originCountrySelect.addEventListener('change', (e) => {
      state.searchFilters.origin_country = e.target.value;
      state.searchFilters.origin_locality = '';
      state.searchFilters.origin_custom = '';
      render();
    });
  }

  const originLocalitySelect = document.getElementById('search-origin-locality');
  if (originLocalitySelect) {
    originLocalitySelect.addEventListener('change', (e) => {
      state.searchFilters.origin_locality = e.target.value;
      render();
    });
  }

  const originCustomInput = document.getElementById('search-origin-custom');
  if (originCustomInput) {
    originCustomInput.addEventListener('input', (e) => {
      state.searchFilters.origin_custom = e.target.value;
    });
  }

  const destCountrySelect = document.getElementById('search-dest-country');
  if (destCountrySelect) {
    destCountrySelect.addEventListener('change', (e) => {
      state.searchFilters.destination_country = e.target.value;
      state.searchFilters.destination_locality = '';
      state.searchFilters.destination_custom = '';
      render();
    });
  }

  const destLocalitySelect = document.getElementById('search-dest-locality');
  if (destLocalitySelect) {
    destLocalitySelect.addEventListener('change', (e) => {
      state.searchFilters.destination_locality = e.target.value;
      render();
    });
  }

  const destCustomInput = document.getElementById('search-dest-custom');
  if (destCustomInput) {
    destCustomInput.addEventListener('input', (e) => {
      state.searchFilters.destination_custom = e.target.value;
    });
  }

  const bodyTypeSelect = document.getElementById('search-body-type');
  if (bodyTypeSelect) {
    bodyTypeSelect.addEventListener('change', (e) => {
      state.searchFilters.body_type = e.target.value;
    });
  }

  const sortSelect = document.getElementById('search-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.searchFilters.sort = e.target.value;
      loadPublicListings();
    });
  }

  // Swap Origin and Destination (Cargo)
  const btnSwap = document.getElementById('btn-swap-filters');
  if (btnSwap) {
    btnSwap.addEventListener('click', () => {
      btnSwap.classList.remove('animate-spin-once');
      void btnSwap.offsetWidth;
      btnSwap.classList.add('animate-spin-once');

      const tempCountry = state.searchFilters.origin_country;
      const tempLocality = state.searchFilters.origin_locality;
      const tempCustom = state.searchFilters.origin_custom;

      state.searchFilters.origin_country = state.searchFilters.destination_country;
      state.searchFilters.origin_locality = state.searchFilters.destination_locality;
      state.searchFilters.origin_custom = state.searchFilters.destination_custom;

      state.searchFilters.destination_country = tempCountry;
      state.searchFilters.destination_locality = tempLocality;
      state.searchFilters.destination_custom = tempCustom;

      setTimeout(() => {
        render();
        loadPublicListings();
      }, 180);
    });
  }

  const btnSearch = document.getElementById('btn-apply-search');
  if (btnSearch) {
    btnSearch.addEventListener('click', () => {
      loadPublicListings();
    });
  }

  const btnClear = document.getElementById('btn-clear-filters');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      state.searchFilters = {
        origin_country: '',
        origin_locality: '',
        origin_custom: '',
        destination_country: '',
        destination_locality: '',
        destination_custom: '',
        body_type: '',
        sort: 'newest'
      };
      render();
      loadPublicListings();
    });
  }

  // Truck Search Filter Event Bindings
  const truckOriginCountry = document.getElementById('search-truck-origin-country');
  if (truckOriginCountry) {
    truckOriginCountry.addEventListener('change', (e) => {
      state.truckSearchFilters.origin_country = e.target.value;
      state.truckSearchFilters.origin_city = '';
      state.truckSearchFilters.origin_custom = '';
      render();
    });
  }

  const truckOriginCity = document.getElementById('search-truck-origin-city');
  if (truckOriginCity) {
    truckOriginCity.addEventListener('change', (e) => {
      state.truckSearchFilters.origin_city = e.target.value;
      render();
    });
  }

  const truckOriginCustom = document.getElementById('search-truck-origin-custom');
  if (truckOriginCustom) {
    truckOriginCustom.addEventListener('input', (e) => {
      state.truckSearchFilters.origin_custom = e.target.value;
    });
  }

  const truckDestCountry = document.getElementById('search-truck-dest-country');
  if (truckDestCountry) {
    truckDestCountry.addEventListener('change', (e) => {
      state.truckSearchFilters.destination_country = e.target.value;
      state.truckSearchFilters.destination_city = '';
      state.truckSearchFilters.destination_custom = '';
      render();
    });
  }

  const truckDestCity = document.getElementById('search-truck-dest-city');
  if (truckDestCity) {
    truckDestCity.addEventListener('change', (e) => {
      state.truckSearchFilters.destination_city = e.target.value;
      render();
    });
  }

  const truckDestCustom = document.getElementById('search-truck-dest-custom');
  if (truckDestCustom) {
    truckDestCustom.addEventListener('input', (e) => {
      state.truckSearchFilters.destination_custom = e.target.value;
    });
  }

  const truckBodyType = document.getElementById('search-truck-body-type');
  if (truckBodyType) {
    truckBodyType.addEventListener('change', (e) => {
      state.truckSearchFilters.body_type = e.target.value;
    });
  }

  const truckSort = document.getElementById('search-truck-sort');
  if (truckSort) {
    truckSort.addEventListener('change', (e) => {
      state.truckSearchFilters.sort = e.target.value;
      loadPublicTransports();
    });
  }

  // Swap Origin and Destination (Truck)
  const btnSwapTruck = document.getElementById('btn-swap-truck-filters');
  if (btnSwapTruck) {
    btnSwapTruck.addEventListener('click', () => {
      btnSwapTruck.classList.remove('animate-spin-once');
      void btnSwapTruck.offsetWidth;
      btnSwapTruck.classList.add('animate-spin-once');

      const tempCountry = state.truckSearchFilters.origin_country;
      const tempCity = state.truckSearchFilters.origin_city;
      const tempCustom = state.truckSearchFilters.origin_custom;

      state.truckSearchFilters.origin_country = state.truckSearchFilters.destination_country;
      state.truckSearchFilters.origin_city = state.truckSearchFilters.destination_city;
      state.truckSearchFilters.origin_custom = state.truckSearchFilters.destination_custom;

      state.truckSearchFilters.destination_country = tempCountry;
      state.truckSearchFilters.destination_city = tempCity;
      state.truckSearchFilters.destination_custom = tempCustom;

      setTimeout(() => {
        render();
        loadPublicTransports();
      }, 180);
    });
  }

  const btnApplyTruckSearch = document.getElementById('btn-apply-truck-search');
  if (btnApplyTruckSearch) {
    btnApplyTruckSearch.addEventListener('click', () => {
      loadPublicTransports();
    });
  }

  const btnClearTruckFilters = document.getElementById('btn-clear-truck-filters');
  if (btnClearTruckFilters) {
    btnClearTruckFilters.addEventListener('click', () => {
      state.truckSearchFilters = {
        origin_country: '',
        origin_city: '',
        origin_custom: '',
        destination_country: '',
        destination_city: '',
        destination_custom: '',
        body_type: '',
        sort: 'newest'
      };
      render();
      loadPublicTransports();
    });
  }

  // Phone Reveal Action
  document.querySelectorAll('.btn-reveal-truck-phone').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      state.revealedPhones[id] = true;
      render();
    });
  });

  // Detail Page Edit Button (Cargo)
  const btnEditDetail = document.getElementById('btn-edit-detail-listing');
  if (btnEditDetail && state.currentListing) {
    btnEditDetail.addEventListener('click', () => {
      state.modal = { type: 'edit_listing', data: state.currentListing };
      renderModal();
    });
  }

  // AI Smart Fill (Cargo)
  const btnPubAiFill = document.getElementById('btn-pub-ai-fill');
  if (btnPubAiFill) {
    btnPubAiFill.addEventListener('click', () => {
      handleAiSmartFill('cargo');
    });
  }

  const pubAiText = document.getElementById('pub-ai-text');
  if (pubAiText) {
    pubAiText.addEventListener('input', (e) => {
      state.aiCargoText = e.target.value;
    });
    pubAiText.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleAiSmartFill('cargo');
      }
    });
  }

  // Publish Cargo Form Live Bindings
  const pubOriginCountry = document.getElementById('pub-origin-country');
  if (pubOriginCountry) {
    pubOriginCountry.addEventListener('change', (e) => {
      state.publishDraft.origin_country = e.target.value;
      const c = state.metadata.locations.find(item => item.code === e.target.value);
      state.publishDraft.origin_locality = c && c.localities[0] ? c.localities[0].id : '__custom__';
      render();
    });
  }

  const pubOriginLocality = document.getElementById('pub-origin-locality');
  if (pubOriginLocality) {
    pubOriginLocality.addEventListener('change', (e) => {
      state.publishDraft.origin_locality = e.target.value;
      render();
    });
  }

  const pubDestCountry = document.getElementById('pub-dest-country');
  if (pubDestCountry) {
    pubDestCountry.addEventListener('change', (e) => {
      state.publishDraft.destination_country = e.target.value;
      const c = state.metadata.locations.find(item => item.code === e.target.value);
      state.publishDraft.destination_locality = c && c.localities[0] ? c.localities[0].id : '__custom__';
      render();
    });
  }

  const pubDestLocality = document.getElementById('pub-dest-locality');
  if (pubDestLocality) {
    pubDestLocality.addEventListener('change', (e) => {
      state.publishDraft.destination_locality = e.target.value;
      render();
    });
  }

  document.querySelectorAll('input[name="loading_date_type"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.publishDraft.loading_date_type = e.target.value;
      render();
    });
  });

  document.querySelectorAll('input[name="price_type"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.publishDraft.price_type = e.target.value;
      render();
    });
  });

  // Publish Cargo Form Submit
  const formPublish = document.getElementById('form-publish-cargo');
  if (formPublish) {
    formPublish.addEventListener('submit', (e) => {
      e.preventDefault();
      if (state.publishFormSubmitting) return;

      const isOriginCustom = state.publishDraft.origin_locality === '__custom__';
      const originLocVal = isOriginCustom 
        ? (document.getElementById('pub-origin-custom') ? document.getElementById('pub-origin-custom').value.trim() : '')
        : state.publishDraft.origin_locality;

      const isDestCustom = state.publishDraft.destination_locality === '__custom__';
      const destLocVal = isDestCustom 
        ? (document.getElementById('pub-dest-custom') ? document.getElementById('pub-dest-custom').value.trim() : '')
        : state.publishDraft.destination_locality;

      const cargo_name = document.getElementById('pub-cargo-name').value.trim();
      const body_type = document.getElementById('pub-body-type').value;
      const weight = parseFloat(document.getElementById('pub-weight').value);
      const volume = document.getElementById('pub-volume').value;
      const dim_length = document.getElementById('pub-dim-length') ? document.getElementById('pub-dim-length').value : '';
      const dim_width = document.getElementById('pub-dim-width') ? document.getElementById('pub-dim-width').value : '';
      const dim_height = document.getElementById('pub-dim-height') ? document.getElementById('pub-dim-height').value : '';
      const cargo_description = document.getElementById('pub-description').value.trim();

      const loading_date_type = state.publishDraft.loading_date_type;
      const loading_date = loading_date_type === 'specific' 
        ? (document.getElementById('pub-loading-date') ? document.getElementById('pub-loading-date').value : '')
        : null;

      const price_type = state.publishDraft.price_type;
      const price_amount = price_type === 'fixed' 
        ? (document.getElementById('pub-price-amount') ? parseFloat(document.getElementById('pub-price-amount').value) : null)
        : null;
      const price_currency = price_type === 'fixed' 
        ? (document.getElementById('pub-price-currency') ? document.getElementById('pub-price-currency').value : 'USD')
        : 'USD';

      handleListingPublish({
        origin_country: state.publishDraft.origin_country,
        origin_locality: originLocVal,
        origin_custom: isOriginCustom ? 1 : 0,
        destination_country: state.publishDraft.destination_country,
        destination_locality: destLocVal,
        destination_custom: isDestCustom ? 1 : 0,
        cargo_name,
        cargo_description,
        weight,
        volume: volume !== '' ? parseFloat(volume) : null,
        dim_length: dim_length !== '' ? parseFloat(dim_length) : null,
        dim_width: dim_width !== '' ? parseFloat(dim_width) : null,
        dim_height: dim_height !== '' ? parseFloat(dim_height) : null,
        body_type,
        loading_date_type,
        loading_date,
        price_type,
        price_amount,
        price_currency
      });
    });
  }

  // AI Smart Fill (Transport)
  const btnPtAiFill = document.getElementById('btn-pt-ai-fill');
  if (btnPtAiFill) {
    btnPtAiFill.addEventListener('click', () => {
      handleAiSmartFill('transport');
    });
  }

  const ptAiText = document.getElementById('pt-ai-text');
  if (ptAiText) {
    ptAiText.addEventListener('input', (e) => {
      state.aiTruckText = e.target.value;
    });
    ptAiText.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleAiSmartFill('transport');
      }
    });
  }

  // Publish Truck Form Live Bindings
  const ptOriginCountry = document.getElementById('pt-origin-country');
  if (ptOriginCountry) {
    ptOriginCountry.addEventListener('change', (e) => {
      state.publishTruckDraft.origin_country = e.target.value;
      const c = state.metadata.locations.find(item => item.code === e.target.value);
      state.publishTruckDraft.origin_city = c && c.localities[0] ? c.localities[0].id : '__custom__';
      render();
    });
  }

  const ptOriginCity = document.getElementById('pt-origin-city');
  if (ptOriginCity) {
    ptOriginCity.addEventListener('change', (e) => {
      state.publishTruckDraft.origin_city = e.target.value;
      render();
    });
  }

  const ptDestCountry = document.getElementById('pt-dest-country');
  if (ptDestCountry) {
    ptDestCountry.addEventListener('change', (e) => {
      state.publishTruckDraft.destination_country = e.target.value;
      const c = state.metadata.locations.find(item => item.code === e.target.value);
      state.publishTruckDraft.destination_city = c && c.localities[0] ? c.localities[0].id : '';
      render();
    });
  }

  const ptDestCity = document.getElementById('pt-dest-city');
  if (ptDestCity) {
    ptDestCity.addEventListener('change', (e) => {
      state.publishTruckDraft.destination_city = e.target.value;
      render();
    });
  }

  // Publish Truck Form Submit
  const formPublishTruck = document.getElementById('form-publish-truck');
  if (formPublishTruck) {
    formPublishTruck.addEventListener('submit', (e) => {
      e.preventDefault();
      if (state.publishTruckFormSubmitting) return;

      const isOriginCustom = state.publishTruckDraft.origin_city === '__custom__';
      const originCityVal = isOriginCustom 
        ? (document.getElementById('pt-origin-custom') ? document.getElementById('pt-origin-custom').value.trim() : '')
        : state.publishTruckDraft.origin_city;

      const isDestCustom = state.publishTruckDraft.destination_city === '__custom__';
      const destCityVal = isDestCustom 
        ? (document.getElementById('pt-dest-custom') ? document.getElementById('pt-dest-custom').value.trim() : '')
        : state.publishTruckDraft.destination_city;

      const truck_model = document.getElementById('pt-truck-model') ? document.getElementById('pt-truck-model').value.trim() : '';
      const body_type = document.getElementById('pt-body-type').value;
      const max_weight = parseFloat(document.getElementById('pt-max-weight').value);
      const volume = document.getElementById('pt-volume') ? document.getElementById('pt-volume').value : '';
      const available_date = document.getElementById('pt-available-date') ? document.getElementById('pt-available-date').value : '';
      const price_expectation = document.getElementById('pt-price-expectation') ? document.getElementById('pt-price-expectation').value.trim() : '';
      const phone = document.getElementById('pt-phone').value.trim();
      const notes = document.getElementById('pt-notes') ? document.getElementById('pt-notes').value.trim() : '';

      handlePublishTruck({
        origin_country: state.publishTruckDraft.origin_country,
        origin_city: originCityVal,
        destination_country: state.publishTruckDraft.destination_country || null,
        destination_city: destCityVal || null,
        body_type,
        truck_model,
        max_weight,
        volume: volume !== '' ? parseFloat(volume) : null,
        available_date,
        price_expectation,
        phone,
        notes
      });
    });
  }

  // My Cargo Listings Actions (Edit, Close, Reactivate)
  document.querySelectorAll('.btn-edit-my-listing').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const item = state.myListings.find(l => l.id === id);
      if (item) {
        state.modal = { type: 'edit_listing', data: item };
        renderModal();
      }
    });
  });

  document.querySelectorAll('.btn-close-my-listing').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm(t('confirm_close_text'))) {
        handleListingStatusToggle(id, 'closed');
      }
    });
  });

  document.querySelectorAll('.btn-reactivate-my-listing').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm(t('confirm_reactivate_text'))) {
        handleListingStatusToggle(id, 'active');
      }
    });
  });

  // My Trucks Actions (Close, Reactivate, Delete)
  document.querySelectorAll('.btn-close-my-truck').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm(t('confirm_close_text'))) {
        handleStatusToggleTransport(id, 'closed');
      }
    });
  });

  document.querySelectorAll('.btn-reactivate-my-truck').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm(t('confirm_reactivate_text'))) {
        handleStatusToggleTransport(id, 'active');
      }
    });
  });

  document.querySelectorAll('.btn-delete-my-truck').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm(t('confirm_delete_truck_text'))) {
        handleDeleteTransport(id);
      }
    });
  });

  // Profile Form Submit
  const formProfile = document.getElementById('form-update-profile');
  if (formProfile) {
    formProfile.addEventListener('submit', (e) => {
      e.preventDefault();
      const first_name = document.getElementById('profile-first-name').value.trim();
      const last_name = document.getElementById('profile-last-name').value.trim();
      const phone = document.getElementById('profile-phone').value.trim();
      const role = document.getElementById('profile-role').value;
      handleProfileSave({ first_name, last_name, phone, role });
    });
  }

  // Auth Form Submit
  const formAuth = document.getElementById('form-auth-submit');
  if (formAuth) {
    formAuth.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('auth-email').value.trim();
      const password = document.getElementById('auth-password').value;
      const isRegister = state.routeParams.mode === 'register';

      if (isRegister) {
        handleRegister(email, password);
      } else {
        handleLogin(email, password);
      }
    });
  }

  const switchToRegister = document.getElementById('switch-to-register');
  if (switchToRegister) {
    switchToRegister.addEventListener('click', () => {
      state.routeParams.mode = 'register';
      render();
    });
  }

  const switchToLogin = document.getElementById('switch-to-login');
  if (switchToLogin) {
    switchToLogin.addEventListener('click', () => {
      state.routeParams.mode = 'login';
      render();
    });
  }

  // Chat Search Filter
  const chatFilterInput = document.getElementById('chat-filter-input');
  if (chatFilterInput) {
    chatFilterInput.addEventListener('input', (e) => {
      state.chatFilter = e.target.value;
      updateConversationsListDom();
    });
  }

  // Conversation Item Selection
  document.querySelectorAll('.chat-conv-item').forEach(item => {
    item.addEventListener('click', async (e) => {
      const convId = e.currentTarget.getAttribute('data-conv-id');
      if (convId && convId !== state.activeConversationId) {
        state.activeConversationId = convId;
        window.location.hash = `#/messages?id=${convId}`;
        await loadActiveConversation(convId);
        render();
        scrollChatToBottom();
      }
    });
  });

  // Mobile Back Button
  const btnChatMobileBack = document.getElementById('btn-chat-mobile-back');
  if (btnChatMobileBack) {
    btnChatMobileBack.addEventListener('click', () => {
      state.activeConversationId = null;
      state.activeConversationData = null;
      window.location.hash = '#/messages';
      render();
    });
  }

  // Mobile Drawer Toggle
  const btnToggleDrawer = document.getElementById('btn-toggle-mobile-drawer');
  const drawerEl = document.getElementById('mobile-slide-drawer');
  const drawerBackdrop = document.getElementById('mobile-drawer-backdrop');
  const btnCloseDrawer = document.getElementById('btn-close-mobile-drawer');

  const closeMobileDrawer = () => {
    state.mobileDrawerOpen = false;
    if (drawerEl) drawerEl.classList.remove('open');
    if (drawerBackdrop) drawerBackdrop.classList.remove('open');
  };

  const openMobileDrawer = () => {
    state.mobileDrawerOpen = true;
    if (drawerEl) drawerEl.classList.add('open');
    if (drawerBackdrop) drawerBackdrop.classList.add('open');
  };

  if (btnToggleDrawer) {
    btnToggleDrawer.addEventListener('click', () => {
      if (drawerEl && drawerEl.classList.contains('open')) {
        closeMobileDrawer();
      } else {
        openMobileDrawer();
      }
    });
  }

  if (btnCloseDrawer) {
    btnCloseDrawer.addEventListener('click', closeMobileDrawer);
  }

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', closeMobileDrawer);
  }

  document.querySelectorAll('.mobile-drawer-link').forEach(link => {
    link.addEventListener('click', closeMobileDrawer);
  });

  const btnLogoutDrawer = document.getElementById('btn-logout-drawer');
  if (btnLogoutDrawer) {
    btnLogoutDrawer.addEventListener('click', () => {
      closeMobileDrawer();
      handleLogout();
    });
  }

  // PWA Install in Drawer
  const btnPwaDrawer = document.getElementById('btn-pwa-install-drawer');
  if (btnPwaDrawer) {
    btnPwaDrawer.addEventListener('click', () => {
      closeMobileDrawer();
      triggerPwaInstall();
    });
  }

  // Quick Logistics Negotiation Templates (1-Tap Send)
  document.querySelectorAll('.chat-template-chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tmpl = e.currentTarget.getAttribute('data-template');
      if (tmpl) {
        handleSendMessage(tmpl);
      }
    });
  });

  // Direct send offer button
  const btnSendOfferDirect = document.getElementById('btn-send-offer-direct');
  if (btnSendOfferDirect) {
    btnSendOfferDirect.addEventListener('click', () => {
      const offerInput = document.getElementById('chat-offer-price-input');
      const amount = offerInput ? parseFloat(offerInput.value) : null;
      if (!amount || amount <= 0) {
        showToast(t('offer_price_placeholder'), 'error');
        return;
      }
      const msgInput = document.getElementById('chat-message-input');
      const content = msgInput ? msgInput.value.trim() : '';
      handleSendMessage(content, amount);
    });
  }

  // Toggle Offer Rate input
  const btnToggleOffer = document.getElementById('btn-toggle-offer');
  if (btnToggleOffer) {
    btnToggleOffer.addEventListener('click', () => {
      state.chatOfferInputVisible = !state.chatOfferInputVisible;
      render();
      const offerInput = document.getElementById('chat-offer-price-input');
      if (offerInput) offerInput.focus();
    });
  }

  const btnCancelOffer = document.getElementById('btn-cancel-offer');
  if (btnCancelOffer) {
    btnCancelOffer.addEventListener('click', () => {
      state.chatOfferInputVisible = false;
      state.chatOfferAmount = '';
      render();
    });
  }

  // Chat Message Input live tracking
  const chatMsgInput = document.getElementById('chat-message-input');
  if (chatMsgInput) {
    chatMsgInput.addEventListener('input', (e) => {
      state.chatMessageDraft = e.target.value;
    });
  }

  const chatOfferPriceInput = document.getElementById('chat-offer-price-input');
  if (chatOfferPriceInput) {
    chatOfferPriceInput.addEventListener('input', (e) => {
      state.chatOfferAmount = e.target.value;
    });
  }

  // Submit Chat Message
  const formChatSend = document.getElementById('form-chat-send');
  if (formChatSend) {
    formChatSend.addEventListener('submit', (e) => {
      e.preventDefault();
      const content = document.getElementById('chat-message-input') ? document.getElementById('chat-message-input').value.trim() : '';
      const offerInput = document.getElementById('chat-offer-price-input');
      const offeredPrice = (state.chatOfferInputVisible && offerInput && offerInput.value) ? parseFloat(offerInput.value) : null;
      if (!content && !offeredPrice) return;
      handleSendMessage(content, offeredPrice);
    });
  }

  // Chat Action Buttons on Listings
  document.querySelectorAll('.btn-cargo-chat').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = e.currentTarget.getAttribute('data-id');
      const ownerId = e.currentTarget.getAttribute('data-owner');
      startChatFromListing('cargo', id, ownerId);
    });
  });

  document.querySelectorAll('.btn-truck-chat').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = e.currentTarget.getAttribute('data-id');
      const ownerId = e.currentTarget.getAttribute('data-owner');
      startChatFromListing('transport', id, ownerId);
    });
  });

  // Admin Events
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.getAttribute('data-admin-tab');
      if (tab) {
        state.adminTab = tab;
        loadAdminData();
      }
    });
  });

  const btnJumpUsers = document.getElementById('btn-admin-jump-users');
  if (btnJumpUsers) {
    btnJumpUsers.addEventListener('click', () => {
      state.adminTab = 'users';
      loadAdminData();
    });
  }

  const btnJumpMod = document.getElementById('btn-admin-jump-moderation');
  if (btnJumpMod) {
    btnJumpMod.addEventListener('click', () => {
      state.adminTab = 'moderation';
      loadAdminData();
    });
  }

  const btnJumpSub = document.getElementById('btn-admin-jump-subscriptions');
  if (btnJumpSub) {
    btnJumpSub.addEventListener('click', () => {
      state.adminTab = 'subscriptions';
      loadAdminData();
    });
  }

  const adminUserSearch = document.getElementById('admin-user-search-input');
  if (adminUserSearch) {
    adminUserSearch.addEventListener('input', (e) => {
      state.adminUsersSearch = e.target.value;
      if (state.adminSearchTimer) clearTimeout(state.adminSearchTimer);
      state.adminSearchTimer = setTimeout(async () => {
        await loadAdminUsers();
        render();
        const input = document.getElementById('admin-user-search-input');
        if (input) {
          input.focus();
          input.setSelectionRange(input.value.length, input.value.length);
        }
      }, 300);
    });
  }

  const adminRoleFilter = document.getElementById('admin-user-role-filter');
  if (adminRoleFilter) {
    adminRoleFilter.addEventListener('change', async (e) => {
      state.adminRoleFilter = e.target.value;
      await loadAdminUsers();
      render();
    });
  }

  document.querySelectorAll('.btn-admin-verify-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const uid = e.currentTarget.getAttribute('data-user-id');
      const cur = e.currentTarget.getAttribute('data-verified') === '1';
      handleToggleUserVerify(uid, cur);
    });
  });

  document.querySelectorAll('.btn-admin-ban-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const uid = e.currentTarget.getAttribute('data-user-id');
      const cur = e.currentTarget.getAttribute('data-banned') === '1';
      handleToggleUserBan(uid, cur);
    });
  });

  document.querySelectorAll('.admin-user-role-select').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const uid = e.currentTarget.getAttribute('data-user-id');
      const newRole = e.currentTarget.value;
      handleChangeUserRole(uid, newRole);
    });
  });

  document.querySelectorAll('.admin-mod-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modTab = e.currentTarget.getAttribute('data-mod-tab');
      if (modTab) {
        state.adminModerationTab = modTab;
        render();
      }
    });
  });

  document.querySelectorAll('.btn-admin-delete-listing').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = e.currentTarget.getAttribute('data-type');
      const id = e.currentTarget.getAttribute('data-id');
      handleAdminDeleteListing(type, id);
    });
  });

  // Unlock Phone Button (Cargo & Trucks)
  document.querySelectorAll('.btn-unlock-phone').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const type = e.currentTarget.getAttribute('data-type');
      const id = e.currentTarget.getAttribute('data-id');
      handleUnlockContact(type, id);
    });
  });

  // Stage 2: AI Smart Matching Button
  document.querySelectorAll('.btn-find-matches').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const type = e.currentTarget.getAttribute('data-type');
      const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
      openAiMatchModal(type, id);
    });
  });

  // Plan Selection on Pricing Page
  document.querySelectorAll('.btn-plan-select').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const planId = parseInt(e.currentTarget.getAttribute('data-plan-id'), 10);
      const plan = state.plans.find(p => p.id === planId);
      if (plan) {
        if (!state.user) {
          navigate('/auth');
          return;
        }
        state.modal = { type: 'payment_request', plan };
        renderModal();
      }
    });
  });

  // Admin Subscriptions Sub-tabs
  document.querySelectorAll('.admin-sub-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const subTab = e.currentTarget.getAttribute('data-sub-tab');
      if (subTab) {
        state.adminSubTab = subTab;
        render();
      }
    });
  });

  // Admin Approve / Reject Subscription Request
  document.querySelectorAll('.btn-admin-approve-sub').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const reqId = e.currentTarget.getAttribute('data-req-id');
      try {
        await api(`/api/admin/subscription-requests/${reqId}/approve`, { method: 'POST' });
        showToast('Obuna so‘rovi tasdiqlandi va foydalanuvchiga obuna berildi', 'success');
        await loadAdminSubData();
        await loadAdminStats();
        render();
      } catch (err) {
        showToast(err.message || t('err_general'), 'error');
      }
    });
  });

  document.querySelectorAll('.btn-admin-reject-sub').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const reqId = e.currentTarget.getAttribute('data-req-id');
      try {
        await api(`/api/admin/subscription-requests/${reqId}/reject`, { method: 'POST' });
        showToast('Obuna so‘rovi rad etildi', 'info');
        await loadAdminSubData();
        await loadAdminStats();
        render();
      } catch (err) {
        showToast(err.message || t('err_general'), 'error');
      }
    });
  });

  // Admin Plans: Add & Delete
  const btnOpenAddPlan = document.getElementById('btn-admin-open-add-plan');
  if (btnOpenAddPlan) {
    btnOpenAddPlan.addEventListener('click', () => {
      state.modal = { type: 'admin_add_plan' };
      renderModal();
    });
  }

  document.querySelectorAll('.btn-admin-delete-plan').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const planId = e.currentTarget.getAttribute('data-plan-id');
      if (!confirm('Ushbu tarifni o‘chirishni tasdiqlaysizmi?')) return;
      try {
        await api(`/api/admin/plans/${planId}`, { method: 'DELETE' });
        showToast('Tarif o‘chirildi', 'success');
        await loadAdminSubData();
        render();
      } catch (err) {
        showToast(err.message || t('err_general'), 'error');
      }
    });
  });

  // Admin Grant Plan & Reset Contacts in Users Table
  document.querySelectorAll('.btn-admin-grant-sub').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const uid = e.currentTarget.getAttribute('data-user-id');
      const uname = e.currentTarget.getAttribute('data-user-name');
      state.modal = { type: 'admin_grant_user_sub', user: { id: uid, name: uname } };
      renderModal();
    });
  });

  document.querySelectorAll('.btn-admin-reset-contacts').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const uid = e.currentTarget.getAttribute('data-user-id');
      if (!confirm('Foydalanuvchi bepul kontaktlarini 117 taga qaytarishni xohlaysizmi?')) return;
      try {
        await api(`/api/admin/users/${uid}`, {
          method: 'PATCH',
          body: JSON.stringify({ free_contacts_remaining: 117 })
        });
        showToast('Kontaktlar balansi 117 taga tiklandi', 'success');
        await loadAdminUsers();
        render();
      } catch (err) {
        showToast(err.message || t('err_general'), 'error');
      }
    });
  });

  // Admin Payment Settings Form & Live Preview
  const inputCardNum = document.getElementById('admin-card-number');
  if (inputCardNum) {
    inputCardNum.addEventListener('input', (e) => {
      const p = document.getElementById('preview-card-number');
      if (p) p.textContent = e.target.value.trim() || '9860 0301 4455 8899';
    });
  }

  const inputCardHolder = document.getElementById('admin-card-holder');
  if (inputCardHolder) {
    inputCardHolder.addEventListener('input', (e) => {
      const p = document.getElementById('preview-card-holder');
      if (p) p.textContent = (e.target.value.trim() || 'Humo Logistics MCHJ').toUpperCase();
    });
  }

  const inputCardBank = document.getElementById('admin-card-bank');
  if (inputCardBank) {
    inputCardBank.addEventListener('input', (e) => {
      const p = document.getElementById('preview-card-bank');
      if (p) p.textContent = e.target.value.trim() || 'Humo / Uzcard';
    });
  }

  const inputInstUz = document.getElementById('admin-card-inst-uz');
  if (inputInstUz) {
    inputInstUz.addEventListener('input', (e) => {
      const p = document.getElementById('preview-modal-instructions');
      if (p && getLanguage() === 'uz') p.textContent = e.target.value.trim();
    });
  }

  const formAdminPay = document.getElementById('form-admin-payment-settings');
  if (formAdminPay) {
    formAdminPay.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-save-pay-settings');
      if (btn) btn.disabled = true;
      try {
        const body = {
          card_number: document.getElementById('admin-card-number').value.trim(),
          card_holder: document.getElementById('admin-card-holder').value.trim(),
          card_bank: document.getElementById('admin-card-bank').value.trim(),
          instructions_uz: document.getElementById('admin-card-inst-uz').value.trim(),
          instructions_ru: document.getElementById('admin-card-inst-ru').value.trim(),
          instructions_en: document.getElementById('admin-card-inst-en').value.trim()
        };
        const res = await api('/api/admin/payment-settings', {
          method: 'PUT',
          body: JSON.stringify(body)
        });
        state.paymentSettings = res.settings;
        showToast(t('payment_settings_saved_success'), 'success');
        render();
      } catch (err) {
        showToast(err.message || t('err_general'), 'error');
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  }

  // Support Floating Widget Toggle & Close
  const btnToggleSupport = document.getElementById('btn-toggle-support-widget');
  if (btnToggleSupport) {
    btnToggleSupport.addEventListener('click', (e) => {
      e.stopPropagation();
      state.supportWidgetOpen = !state.supportWidgetOpen;
      if (state.supportWidgetOpen) {
        state.aiDispatcherOpen = false;
      }
      render();
    });
  }

  const btnCloseSupport = document.getElementById('btn-close-support-widget');
  if (btnCloseSupport) {
    btnCloseSupport.addEventListener('click', (e) => {
      e.stopPropagation();
      state.supportWidgetOpen = false;
      render();
    });
  }

  // Admin Support Sub-tabs
  document.querySelectorAll('.admin-sup-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const subTab = e.currentTarget.getAttribute('data-sup-tab');
      if (subTab) {
        state.adminSupportTab = subTab;
        render();
      }
    });
  });

  // Admin Support Settings Form Submit
  const formSupSettings = document.getElementById('form-admin-support-settings');
  if (formSupSettings) {
    formSupSettings.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-save-support-settings');
      if (btn) btn.disabled = true;
      try {
        const body = {
          phone: document.getElementById('sup-phone').value.trim(),
          email: document.getElementById('sup-email').value.trim(),
          telegram_support: document.getElementById('sup-telegram').value.trim(),
          whatsapp_support: document.getElementById('sup-whatsapp').value.trim(),
          working_hours_uz: document.getElementById('sup-hours-uz').value.trim(),
          working_hours_ru: document.getElementById('sup-hours-ru').value.trim(),
          working_hours_en: document.getElementById('sup-hours-en').value.trim(),
          address_uz: document.getElementById('sup-addr-uz').value.trim(),
          address_ru: document.getElementById('sup-addr-ru').value.trim(),
          address_en: document.getElementById('sup-addr-en').value.trim(),
          is_widget_enabled: document.getElementById('sup-widget-enabled').checked,
          is_address_enabled: document.getElementById('sup-address-enabled') ? document.getElementById('sup-address-enabled').checked : false
        };
        const res = await api('/api/admin/support/settings', {
          method: 'PUT',
          body: JSON.stringify(body)
        });
        state.supportSettings = res.settings;
        showToast(t('support_settings_saved_success'), 'success');
        render();
      } catch (err) {
        showToast(err.message || t('err_general'), 'error');
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  }

  // Admin Open Add Social Modal
  const btnOpenAddSocial = document.getElementById('btn-admin-open-add-social');
  if (btnOpenAddSocial) {
    btnOpenAddSocial.addEventListener('click', () => {
      state.modal = { type: 'admin_add_social' };
      renderModal();
    });
  }

  // Admin Edit Social Link
  document.querySelectorAll('.btn-admin-edit-social').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
      const social = (state.adminSocials || []).find(s => s.id === id);
      if (social) {
        state.modal = { type: 'admin_edit_social', social };
        renderModal();
      }
    });
  });

  // Admin Delete Social Link
  document.querySelectorAll('.btn-admin-delete-social').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (!confirm(t('confirm_delete_social'))) return;
      try {
        await api(`/api/admin/support/socials/${id}`, { method: 'DELETE' });
        showToast(t('social_deleted_success'), 'success');
        await loadAdminSupportData();
        render();
      } catch (err) {
        showToast(err.message || t('err_general'), 'error');
      }
    });
  });

  // PWA Install Event Listeners
  const btnPwaBannerInstall = document.getElementById('btn-pwa-banner-install');
  if (btnPwaBannerInstall) {
    btnPwaBannerInstall.addEventListener('click', triggerPwaInstall);
  }

  const btnPwaBannerDismiss = document.getElementById('btn-pwa-banner-dismiss');
  if (btnPwaBannerDismiss) {
    btnPwaBannerDismiss.addEventListener('click', () => {
      sessionStorage.setItem('humo_pwa_banner_dismissed', '1');
      state.showPwaBanner = false;
      const banner = document.getElementById('pwa-install-banner');
      if (banner) banner.remove();
    });
  }

  const btnPwaSidebar = document.getElementById('btn-pwa-install-sidebar');
  if (btnPwaSidebar) {
    btnPwaSidebar.addEventListener('click', triggerPwaInstall);
  }

  const btnPwaHeader = document.getElementById('btn-pwa-install-header');
  if (btnPwaHeader) {
    btnPwaHeader.addEventListener('click', triggerPwaInstall);
  }

  // Stage 3: Humo AI Dispatcher Assistant Events
  const btnToggleAiDispatcher = document.getElementById('btn-toggle-ai-dispatcher');
  if (btnToggleAiDispatcher) {
    btnToggleAiDispatcher.addEventListener('click', (e) => {
      e.stopPropagation();
      state.aiDispatcherOpen = !state.aiDispatcherOpen;
      if (state.aiDispatcherOpen) {
        state.supportWidgetOpen = false;
      }
      render();
      if (state.aiDispatcherOpen) {
        setTimeout(() => {
          const inputEl = document.getElementById('input-ai-dispatcher');
          if (inputEl) inputEl.focus();
          const scrollEl = document.getElementById('ai-dispatcher-body-scroll');
          if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
        }, 100);
      }
    });
  }

  const btnCloseAiDispatcher = document.getElementById('btn-close-ai-dispatcher');
  if (btnCloseAiDispatcher) {
    btnCloseAiDispatcher.addEventListener('click', (e) => {
      e.stopPropagation();
      state.aiDispatcherOpen = false;
      render();
    });
  }

  const btnMinimizeAiDispatcher = document.getElementById('btn-minimize-ai-dispatcher');
  if (btnMinimizeAiDispatcher) {
    btnMinimizeAiDispatcher.addEventListener('click', (e) => {
      e.stopPropagation();
      state.aiDispatcherOpen = false;
      render();
    });
  }

  const btnClearAiDispatcher = document.getElementById('btn-clear-ai-dispatcher');
  if (btnClearAiDispatcher) {
    btnClearAiDispatcher.addEventListener('click', (e) => {
      e.stopPropagation();
      state.aiDispatcherMessages = [];
      render();
    });
  }

  const formAiDispatcher = document.getElementById('form-ai-dispatcher');
  if (formAiDispatcher) {
    formAiDispatcher.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputEl = document.getElementById('input-ai-dispatcher');
      if (!inputEl) return;
      const text = inputEl.value.trim();
      inputEl.value = '';
      handleAiDispatcherSend(text);
    });
  }

  document.querySelectorAll('.btn-ai-chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const q = e.currentTarget.getAttribute('data-question');
      if (q) handleAiDispatcherSend(q);
    });
  });

  // Stage 4: In-Chat One-Click Translation
  document.querySelectorAll('.btn-translate-msg').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const msgId = e.currentTarget.getAttribute('data-msg-id');
      const text = e.currentTarget.getAttribute('data-text');
      btn.disabled = true;
      btn.textContent = t('translating');
      handleTranslateChatMessage(msgId, text);
    });
  });
}

// Utility for safe HTML escaping
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// PWA Service Worker Registration & Global Lifecycle Events
if (typeof window !== 'undefined') {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredPrompt = e;
    state.pwaCanInstall = true;
    if (!sessionStorage.getItem('humo_pwa_banner_dismissed')) {
      state.showPwaBanner = true;
    }
    render();
  });

  window.addEventListener('appinstalled', () => {
    window.deferredPrompt = null;
    state.pwaCanInstall = false;
    state.showPwaBanner = false;
    showToast(t('pwa_installed_success'), 'success');
    render();
  });

  window.addEventListener('online', () => {
    showToast(t('pwa_badge_online'), 'success');
  });

  window.addEventListener('offline', () => {
    showToast(t('pwa_badge_offline'), 'warning');
  });
}

// Kick off app
initApp();

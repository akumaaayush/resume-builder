import raw from './defaultResume.json'
import type { DocConfig } from '../types'

/**
 * Page/typography fallbacks, taken from the seed document so there is one place
 * to edit them. Kept in its own module because the importer needs these
 * defaults and the seed itself is produced by the importer.
 */
export const defaultConfig = raw.config as DocConfig

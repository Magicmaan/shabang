import { create } from 'zustand'
import { createSettingsSlice, SettingsSlice } from './useSettings'
import { createSearchSlice, SearchSlice } from './search/useSearch'

export const useAppStore = create<SearchSlice & SettingsSlice>((...a) => ({
    ...createSettingsSlice(...a),
    ...createSearchSlice(...a),
}))

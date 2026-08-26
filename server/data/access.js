import documentsData from './documents-by-state.json' with { type: 'json' }
import slotsData from './slot-patterns.json' with { type: 'json' }
import outcomesData from './rejection-reasons.json' with { type: 'json' }
import vehicleData from './vehicle-services.json' with { type: 'json' }
import challanData from './challans.json' with { type: 'json' }

// This module is the only data boundary. A database or official integration can replace it later.
export const getDocuments = (state) => state ? documentsData.states[state] ?? null : documentsData.states
export const getSlotPattern = (state, city) => slotsData.rtos.find((rto) => rto.state === state && rto.city.toLowerCase() === (city || '').toLowerCase()) ?? null
export const getAllSlotPatterns = () => slotsData.rtos
export const getOutcome = (code) => outcomesData.outcomes[code] ?? null
export const getAllOutcomes = () => outcomesData.outcomes
export const getTransferDocuments = (type) => vehicleData.transferTypes[type] ?? null
export const getRCStatus = (registration) => vehicleData.rcStatuses.find((item) => item.registration.toLowerCase() === (registration || '').toLowerCase()) ?? null
export const getChallan = (number) => challanData.challans.find((item) => item.number.toLowerCase() === (number || '').toLowerCase()) ?? null
export const getDisputeCategories = () => challanData.disputeCategories

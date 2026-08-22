export interface BankNode {
  id: string
  city: string
  label: string
  state: string
  x: number
  y: number
}

export const BANK_NODES: BankNode[] = [
  { id: 'delhi', city: 'Delhi', label: 'Delhi Central (AIIMS)', state: 'Delhi', x: 340, y: 80 },
  { id: 'chandigarh', city: 'Chandigarh', label: 'Chandigarh PGIMER', state: 'Punjab', x: 310, y: 45 },
  { id: 'lucknow', city: 'Lucknow', label: 'Lucknow KGMU', state: 'Uttar Pradesh', x: 440, y: 110 },
  { id: 'jaipur', city: 'Jaipur', label: 'Jaipur SMS Hospital', state: 'Rajasthan', x: 260, y: 110 },
  { id: 'patna', city: 'Patna', label: 'Patna PMCH', state: 'Bihar', x: 550, y: 130 },
  { id: 'guwahati', city: 'Guwahati', label: 'Guwahati GMCH', state: 'Assam', x: 710, y: 100 },
  { id: 'kolkata', city: 'Kolkata', label: 'Kolkata Medical College', state: 'West Bengal', x: 620, y: 190 },
  { id: 'ahmedabad', city: 'Ahmedabad', label: 'Ahmedabad Civil Hub', state: 'Gujarat', x: 190, y: 180 },
  { id: 'bhopal', city: 'Bhopal', label: 'Bhopal AIIMS', state: 'Madhya Pradesh', x: 350, y: 180 },
  { id: 'mumbai', city: 'Mumbai', label: 'Mumbai KEM / Tata', state: 'Maharashtra', x: 180, y: 270 },
  { id: 'pune', city: 'Pune', label: 'Pune Sassoon Hospital', state: 'Maharashtra', x: 230, y: 300 },
  { id: 'hyderabad', city: 'Hyderabad', label: 'Hyderabad NIMS', state: 'Telangana', x: 370, y: 280 },
  { id: 'bhubaneswar', city: 'Bhubaneswar', label: 'Bhubaneswar AIIMS', state: 'Odisha', x: 560, y: 250 },
  { id: 'bengaluru', city: 'Bengaluru', label: 'Bengaluru Victoria Hub', state: 'Karnataka', x: 340, y: 380 },
  { id: 'chennai', city: 'Chennai', label: 'Chennai Rajiv Gandhi', state: 'Tamil Nadu', x: 430, y: 390 },
  { id: 'kochi', city: 'Kochi', label: 'Kochi Medical College', state: 'Kerala', x: 310, y: 440 },
]

export function resolveBankNode(bankName: string): BankNode | undefined {
  if (!bankName) return undefined
  const lower = bankName.toLowerCase()
  return BANK_NODES.find(
    (node) =>
      lower.includes(node.city.toLowerCase()) ||
      lower.includes(node.id) ||
      lower.includes(node.state.toLowerCase()),
  ) || BANK_NODES[Math.abs(hashString(bankName)) % BANK_NODES.length]
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}

// Global Control CRM Auto-Sync for Founders Beta

const GC_API_KEY = process.env.GLOBAL_CONTROL_API_KEY
const GC_BASE_URL = 'https://api.globalcontrol.io/api/ai'

// Tag Group and Tag Names
const TAG_GROUP_NAME = 'Founders Beta'
const TAGS = {
  CITIZEN: 'Founders Beta - Citizen',
  ENTERPRISE: 'Founders Beta - Enterprise',
  INTAKE_COMPLETE: 'Founders Beta - Intake Complete',
  INVITATION_REQUEST_COMPLETE: 'Founders Beta - Invitation Request Complete',
  CAS_ACCOUNT_CREATED: 'Founders Beta - CAS Account Created',
  SKOOL_COMMUNITY_ADDED: 'Founders Beta - SKOOL Community Added',
}

interface FounderData {
  id: string
  fullName: string
  email: string
  phone: string
  founderLevel: string
  intakeCompleted: boolean
  invitationRequestCompleted: boolean
  casAccountCreated: boolean
  skoolCommunityAdded: boolean
  globalControlContactId?: string | null
}

// Get or create Tag Group
async function getOrCreateTagGroup(): Promise<string> {
  try {
    // List tag groups
    const listRes = await fetch(`${GC_BASE_URL}/tag-groups`, {
      headers: { 'X-API-KEY': GC_API_KEY! }
    })
    const groups = await listRes.json()
    
    const existingGroup = groups.find((g: any) => g.name === TAG_GROUP_NAME)
    if (existingGroup) {
      return existingGroup.id
    }

    // Create new tag group
    const createRes = await fetch(`${GC_BASE_URL}/tag-groups`, {
      method: 'POST',
      headers: {
        'X-API-KEY': GC_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: TAG_GROUP_NAME })
    })
    const newGroup = await createRes.json()
    console.log(`✅ Created Tag Group: ${TAG_GROUP_NAME}`)
    return newGroup.id
  } catch (error) {
    console.error('Error getting/creating tag group:', error)
    throw error
  }
}

// Get or create Tag
async function getOrCreateTag(tagName: string, tagGroupId: string): Promise<string> {
  try {
    // List tags
    const listRes = await fetch(`${GC_BASE_URL}/tags`, {
      headers: { 'X-API-KEY': GC_API_KEY! }
    })
    const tags = await listRes.json()
    
    const existingTag = tags.find((t: any) => t.name === tagName)
    if (existingTag) {
      return existingTag.id
    }

    // Create new tag
    const createRes = await fetch(`${GC_BASE_URL}/tags`, {
      method: 'POST',
      headers: {
        'X-API-KEY': GC_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: tagName,
        tag_group_id: tagGroupId,
      })
    })
    const newTag = await createRes.json()
    console.log(`✅ Created Tag: ${tagName}`)
    return newTag.id
  } catch (error) {
    console.error(`Error getting/creating tag ${tagName}:`, error)
    throw error
  }
}

// Get or create Contact
async function getOrCreateContact(founder: FounderData): Promise<string> {
  try {
    // Search by email
    const searchRes = await fetch(`${GC_BASE_URL}/contacts?email=${encodeURIComponent(founder.email)}`, {
      headers: { 'X-API-KEY': GC_API_KEY! }
    })
    const contacts = await searchRes.json()
    
    if (contacts.length > 0) {
      return contacts[0].id
    }

    // Create new contact
    const [firstName, ...lastNameParts] = founder.fullName.split(' ')
    const lastName = lastNameParts.join(' ')

    const createRes = await fetch(`${GC_BASE_URL}/contacts`, {
      method: 'POST',
      headers: {
        'X-API-KEY': GC_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName || '',
        email: founder.email,
        phone: founder.phone,
        source: 'Founders Beta',
      })
    })
    const newContact = await createRes.json()
    console.log(`✅ Created Contact: ${founder.fullName}`)
    return newContact.id
  } catch (error) {
    console.error('Error getting/creating contact:', error)
    throw error
  }
}

// Fire Tag to Contact
async function fireTag(contactId: string, tagId: string): Promise<void> {
  try {
    await fetch(`${GC_BASE_URL}/tags/${tagId}/fire`, {
      method: 'POST',
      headers: {
        'X-API-KEY': GC_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contact_id: contactId })
    })
  } catch (error) {
    console.error('Error firing tag:', error)
    throw error
  }
}

// Main Sync Function
export async function syncFounderToGlobalControl(founder: FounderData): Promise<string> {
  if (!GC_API_KEY) {
    console.warn('⚠️ GLOBAL_CONTROL_API_KEY not set - skipping sync')
    return ''
  }

  try {
    console.log(`🔄 Syncing Founder to Global Control: ${founder.fullName}`)

    // Get or create tag group
    const tagGroupId = await getOrCreateTagGroup()

    // Get or create contact
    const contactId = founder.globalControlContactId || await getOrCreateContact(founder)

    // Determine which tags to apply based on Founder status
    const tagsToApply: string[] = []

    // Tier tag
    if (founder.founderLevel.includes('Citizen')) {
      const tagId = await getOrCreateTag(TAGS.CITIZEN, tagGroupId)
      tagsToApply.push(tagId)
    } else if (founder.founderLevel.includes('Enterprise')) {
      const tagId = await getOrCreateTag(TAGS.ENTERPRISE, tagGroupId)
      tagsToApply.push(tagId)
    }

    // Intake Complete
    if (founder.intakeCompleted) {
      const tagId = await getOrCreateTag(TAGS.INTAKE_COMPLETE, tagGroupId)
      tagsToApply.push(tagId)
    }

    // Invitation Request Complete
    if (founder.invitationRequestCompleted) {
      const tagId = await getOrCreateTag(TAGS.INVITATION_REQUEST_COMPLETE, tagGroupId)
      tagsToApply.push(tagId)
    }

    // CAS Account Created
    if (founder.casAccountCreated) {
      const tagId = await getOrCreateTag(TAGS.CAS_ACCOUNT_CREATED, tagGroupId)
      tagsToApply.push(tagId)
    }

    // SKOOL Community Added
    if (founder.skoolCommunityAdded) {
      const tagId = await getOrCreateTag(TAGS.SKOOL_COMMUNITY_ADDED, tagGroupId)
      tagsToApply.push(tagId)
    }

    // Fire all tags
    for (const tagId of tagsToApply) {
      await fireTag(contactId, tagId)
    }

    console.log(`✅ Global Control sync complete: ${founder.fullName} (${tagsToApply.length} tags)`)
    
    return contactId

  } catch (error) {
    console.error('❌ Global Control sync failed:', error)
    throw error
  }
}

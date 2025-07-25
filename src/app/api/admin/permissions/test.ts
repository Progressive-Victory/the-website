/* eslint @typescript-eslint/no-floating-promises: 0 */ // --> OFF

// ============ POST ============

// Conflict

fetch('/api/admin/permissions', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({ name: 'test 2' }),
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
})

// Success

fetch('/api/admin/permissions', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({ name: 'some name' }),
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
})

// ============ PATCH ============

// Invalid ID

fetch('/api/admin/permissions', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({ id: 'invalid', name: '' }),
    method: 'PATCH',
    mode: 'cors',
    credentials: 'include',
})

// Missing ID

fetch('/api/admin/permissions', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({ id: '682399cfece48c3157096000', name: '' }),
    method: 'PATCH',
    mode: 'cors',
    credentials: 'include',
})

// Conflicting name

fetch('/api/admin/permissions', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({ id: '682399cfece48c31570964b1', name: 'test 2' }),
    method: 'PATCH',
    mode: 'cors',
    credentials: 'include',
})

// Success

fetch('/api/admin/permissions', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({ id: '682399cfece48c31570964b1', name: 'new name' }),
    method: 'PATCH',
    mode: 'cors',
    credentials: 'include',
})

// ============ DELETE ============

// Invalid ID

fetch('/api/admin/permissions', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({ id: 'invalid' }),
    method: 'DELETE',
    mode: 'cors',
    credentials: 'include',
})

// Missing ID

fetch('/api/admin/permissions', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({ id: '682399cfece48c3157096000' }),
    method: 'DELETE',
    mode: 'cors',
    credentials: 'include',
})

// Sucess

fetch('/api/admin/permissions', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({ id: '688059abed8c8f7624ec17da' }),
    method: 'DELETE',
    mode: 'cors',
    credentials: 'include',
})

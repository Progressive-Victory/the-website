/* eslint @typescript-eslint/no-floating-promises: 0 */ // --> OFF

// ============ POST ============

// Conflict

fetch('/api/admin/roles', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({
        name: 'Superadmin',
        permissions: [],
    }),
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
})

// Invalid permission

fetch('/api/admin/roles', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({
        name: 'test 2',
        permissions: ['invalid'],
    }),
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
})

// Non existant permissions

fetch('/api/admin/roles', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({
        name: 'some role name',
        permissions: ['68239a0eece48c3157096000'],
    }),
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
})

// Success

fetch('/api/admin/roles', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({
        name: 'some role name',
        permissions: ['68239a0eece48c31570964be'],
    }),
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
})

// ============ PATCH ============

// Invalid ID

fetch('/api/admin/roles', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({ id: 'invalid' }),
    method: 'PATCH',
    mode: 'cors',
    credentials: 'include',
})

// Missing ID

fetch('/api/admin/roles', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({ id: '682399cfece48c3157096000', name: '' }),
    method: 'PATCH',
    mode: 'cors',
    credentials: 'include',
})

// Conflicting name

fetch('/api/admin/roles', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({ id: '68805df2ed8c8f7624ec1909', name: 'test 1' }),
    method: 'PATCH',
    mode: 'cors',
    credentials: 'include',
})

// Invalid permission

fetch('/api/admin/roles', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({
        id: '68805df2ed8c8f7624ec1909',
        name: 'test 2',
        permissions: ['invalid'],
    }),
    method: 'PATCH',
    mode: 'cors',
    credentials: 'include',
})

// Missing permission

fetch('/api/admin/roles', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({
        id: '68805df2ed8c8f7624ec1909',
        name: 'test 2',
        permissions: ['682399cfece48c3157096000'],
    }),
    method: 'PATCH',
    mode: 'cors',
    credentials: 'include',
})

// Success

fetch('/api/admin/roles', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({
        id: '68805df2ed8c8f7624ec1909',
        name: 'new name',
        permissions: ['682a2fda4479715a2fbb1ba3'],
    }),
    method: 'PATCH',
    mode: 'cors',
    credentials: 'include',
})

// ============ DELETE ============

// Invalid ID

fetch('/api/admin/roles', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({ id: 'invalid' }),
    method: 'DELETE',
    mode: 'cors',
    credentials: 'include',
})

// Missing ID

fetch('/api/admin/roles', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({ id: '682399cfece48c3157096000' }),
    method: 'DELETE',
    mode: 'cors',
    credentials: 'include',
})

// Sucess

fetch('/api/admin/roles', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({ id: '68805df2ed8c8f7624ec1909' }),
    method: 'DELETE',
    mode: 'cors',
    credentials: 'include',
})

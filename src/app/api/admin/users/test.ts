/* eslint @typescript-eslint/no-floating-promises: 0 */ // --> OFF

// ============ PATCH ============

// Invalid ID

fetch('/api/admin/users', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({ id: 'invalid' }),
    method: 'PATCH',
    mode: 'cors',
    credentials: 'include',
})

// Missing ID

fetch('/api/admin/users', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({ id: '682399cfece48c3157096000' }),
    method: 'PATCH',
    mode: 'cors',
    credentials: 'include',
})

// Invalid role

fetch('/api/admin/users', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({
        id: '686f2242d7aec4bebd626cc3',
        name: 'test 2',
        roles: ['invalid'],
    }),
    method: 'PATCH',
    mode: 'cors',
    credentials: 'include',
})

// Missing role

fetch('/api/admin/users', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({
        id: '686f2242d7aec4bebd626cc3',
        name: 'test 2',
        roles: ['682399cfece48c3157096000'],
    }),
    method: 'PATCH',
    mode: 'cors',
    credentials: 'include',
})

// Success

fetch('/api/admin/users', {
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({
        id: '686f2242d7aec4bebd626cc3',
        name: 'new name',
        roles: ['6802ebe4fd0be66ce0f5ad71', '684335e851f285849c9d9a0a'],
    }),
    method: 'PATCH',
    mode: 'cors',
    credentials: 'include',
})

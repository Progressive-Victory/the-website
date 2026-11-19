const config = {
    siteUrl: 'https://www.progressivevictory.win',
    generateRobotsTxt: true,
    exclude: ['/volunteer_dashboard', '/volunteer_dashboard/*'],
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/volunteer_dashboard'],
            },
        ],
    },
}

export default config

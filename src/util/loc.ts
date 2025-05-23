import fs from 'fs'
import csv from 'csv-parser'

//this is a util file for extrapolating city, county, and state info from the zip csv file given a zip code
export async function getLoc(zip: string): Promise<string[]> {
    console.log(zip)
    let results: string[] = []

    const fd = fs.createReadStream('zip_code_database.csv')
    fd.pipe(csv())
        .on('data', (line) => {
        if(line.zip === zip) {
            console.log(`${zip} found`)
            results = [line.primary_city, line.county, line.state]
        }
    })
    
    const out = new Promise<string[]>((resolve, reject) => {
        fd.on('end', () => resolve(results))
        fd.on('error', reject)
    })

    return out
}
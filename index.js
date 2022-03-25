import fs from 'fs'
import * as dfd from 'danfojs-node'
import { stringify } from 'csv-stringify/sync'
import { fromBech32, toBech32, fromHex, toHex } from '@cosmjs/encoding'

const NETWORK = process.argv[2]

if( !NETWORK ) process.exit(1)

async function read_address_book() {
    return await dfd.readCSV(
        'imports/addresses.csv',
        {
            delimiter: ',',
            header: true
        }
    ).then( df => {
        return df.toJSON( 'row' )
    }).catch( error => {
        console.warn( error )
    })
}

async function convert() {
    const address_book = await read_address_book()

    let addresses = []

    for( const address of address_book ) {
        addresses.push(
            [
                toBech32(NETWORK, 
                    fromHex(
                        toHex(
                            fromBech32(
                                address.address
                            ).data
                        )
                    )
                )
            ]
        )
    }

    const output = stringify(
        addresses,
        {
            header: false
        }
    )

    fs.writeFile(
        `exports/${NETWORK}-converted.csv`,
        output,
        {
            encoding: 'utf-8'
        },
        error => {
            if( error ) console.warn( error )
        }
    )
}

await convert()
'use client'

import { useState, useEffect, ChangeEvent} from "react"
import { Document} from "mongoose"
import { ToolTip } from "../common/ToolTip"
import { Popup } from "../common/Popup"
import { FormEvent } from "react"
import { useSearchParams } from "next/navigation"

//interface to define a dashbrowsers permissions statically
export interface IDashBrowserPerms {
  add: boolean
  delete: boolean
  editWhiteList: Record<string, boolean>
}

/*
// This is the polymorphic form of the admin panel. 
// T - generic type for whatever type of data it is displaying
// apiStr - string giving the relative uri of the api route required to fetch and save data
// title - the string that should be displayed at the top of the panel
// displayKey - the string that will return the field you want the data to use as an identifier
// deps - a record listing all fields holding child mongo entries by key and providing their api route uris
// all api routes that load into sectionData need a count subroute that returns the number of documents in the collection
// theres a bug with the delete function
// theres a bug with searching for results that dont exist and non primitive fields (fuck me side ways)
*/
export default function DashBrowser<T extends Document>(
    {
        apiStr,
        title,
        displayKey,
        deps,
        perms
    } : {
        apiStr: string,
        title: string,
        displayKey: string,
        deps: Record<string, {
          apiUri: string,
          dKey: string
        }>, //dependency type, apiUri, display key
        perms: IDashBrowserPerms
    }
){
    const [sectionData, setSectionData] = useState<T[]>([])
    const [selectedEntry, setSelectedEntry] = useState<T | null>(null)
    const [pageNumber, setPageNumber] = useState<number>(0)
    const [entriesPerPage, setEntriesPerPage] = useState<number>(10)
    const [refresh, setRefresh] = useState<boolean>(false)
    const [, setLoading] = useState(true)
    const [, setError] = useState<string | null>(null)
    const [numPages, setNumPages] = useState<number>(0)
    const [query, setQuery] = useState<string>("")

    //retrieve data for the browser section
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const res = await fetch(`${apiStr}/?pageNumber=${pageNumber}&entriesPerPage=${entriesPerPage}&query=${query}`)
                const count = await fetch(`${apiStr}/count/?query=${query}`)


                if (!res.ok || !count.ok) throw new Error("Failed to fetch data.")

                const data = await res.json()
                const countNum: number = await count.json()
                console.log(data)

                setSectionData(data)
                setNumPages(Math.ceil(countNum/entriesPerPage))

            } catch(err) {
                setError(err instanceof Error ? err.message : "Failed to fetch data.")
                console.error(err)
            } finally {
                setLoading(false)
                console.log("Done loading")
            }
        }
        fetchData()
    }, [refresh, entriesPerPage, pageNumber, query])

    //set the detail viewer to blank if its selected entry no longer exists in section data
    useEffect(() => {
        if (selectedEntry && !sectionData.find(x => x._id === selectedEntry._id)) {
            setSelectedEntry(null)
        }
    }, [sectionData, selectedEntry])

    //handle the creation of a new entry
    const handleCreateT = async (pk: string) => {
        console.log(`creating: ${pk}`)
    }

    // handle the deletion of an entry
    const handleDeleteT = async (pk: string) => {
        const tgt = sectionData.find(x => x[displayKey as keyof T] == pk)
        console.log(`deleting: ${pk}`)
        try {
          const res = await fetch(apiStr, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(tgt)
          })
          if(!res.ok) throw new Error("Data failed to delete!")
          setRefresh(!refresh)
        } catch(err) {
          console.error(err)
        }
    }

    //handle modifying a field on selectedEntry
    const handleModifyT = (ev: ChangeEvent<HTMLInputElement>) => {
      console.log(ev.target.value)
      if(!selectedEntry) return
      selectedEntry[ev.target.name as keyof T] = ev.target.value as any
    }

    //handle modifying an array field on selectedEntry
    const handleModifyTArr = (key: string, arr: object[]) => {
      if(!selectedEntry) return
      selectedEntry[key as keyof T] = arr as any
    }

    //handle saving changes to selectedEntry
    const handleSaveT = async () => {
      console.log("Saving")
      try {
        const res = await fetch(apiStr, {
          method: "PATCH",
          body: JSON.stringify([selectedEntry]),
          headers: {
            "Content-Type": "application/json"
          }
        })
        if(!res.ok) throw new Error("Data failed to save!")
        setRefresh(!refresh)
      } catch(err) {
        console.error(err)
      }
    }

    //search handling function
    const handleSearchT = (fd: FormData) => {
      const search = fd.get("search")?.toString()
      const filter = fd.get("filter")?.toString()
      if(!search) setQuery("")
      else setQuery(`${filter}:${search}`)
    }

    //component for each field
    //I think this is lacking handling for cases where dependency fields arent arrays or arrays have primitives
    const Field = ({fKey} : {fKey : string}) => {
      if(!selectedEntry) return
      //get the field data from selected entry
      const rawData = selectedEntry[fKey as keyof T]
      //test if field is an array; if yes: return array field component; if no: return normal field component
      if(Array.isArray(rawData)){
          //list of array field entries
          const [data, setData] = useState<object[]>(rawData)
          const rec = deps[fKey]
          const uri = rec.apiUri
          const _key = rec.dKey
          //list of field dependencies
          const [fDeps, setFDeps] = useState<object[]>([])

          //handle adding item to array field
          const addItem = (name: string) => {
            console.log("adding")
            const tgt = fDeps.find(x => x[_key as keyof object] == name)
            if(tgt && !data.find(x => x[_key as keyof object] == name)){
              setData([...data, tgt])
              handleModifyTArr(fKey, data)
            } 
          }

          //handle removing item from array field
          const removeItem = (name: string) => {
            console.log("Removing")
            const index = data.findIndex(x => x[_key as keyof object] == name)
            if(index >= 0) {
              data.splice(index, 1)
              setData([...data])
            }
          }

          //retrieve dependency objects from api
          useEffect(() => {
            const getDeps = async () => {
              const res = await fetch(uri)
              setFDeps(await res.json())
            }
            getDeps()
          }, [])

        return(
          <div className={`grid grid-cols-3 py-1 border-b`}>
            <label htmlFor={`${fKey}`}>{fKey}</label>
            <div className="group col-span-2 flex flex-row relative">
              {data.length > 0 ? data.map(item => (
                <div key={item[_key as keyof object]} className="bg-gray-200 rounded px-1 flex gap-1">
                  <span>{item[_key as keyof object] as string}</span>
                  <button className="rounded hover:bg-gray-300 hover:text-white px-1" onClick={() => {removeItem(item[_key as keyof object])}}>x</button>
                </div>
              )) : <span>None</span>}
              <select
                className="group-hover:block hidden absolute right-0 top-0 px-1 rounded bg-gray-200 w-[30px] hover:bg-gray-300"
                value=""
                onChange={(ev) => {
                  console.log("press")
                  addItem(ev.target.value)}}
              >
                <option value="">+</option>
                {fDeps.map((dep) => (
                  <option key={dep[_key as keyof object]} value={dep[_key as keyof object]}>{dep[_key as keyof object]}</option>
                ))}
              </select>
            </div>
          </div>
        )
      } else {
        const [val, setVal] = useState<string>(rawData as string)
        return (
          <div key={fKey} className="grid grid-cols-3 py-1 border-b">
            <label htmlFor={fKey}>{fKey}</label>
            {perms.editWhiteList[fKey] ? (
              <input 
                name={fKey}
                id={fKey}
                value={val}
                className="col-span-2"
                onChange={(ev) => {
                  ev.preventDefault()
                  handleModifyT(ev)
                  setVal(ev.target.value)
                }}
              />) : (
                <div className="col-span-2 break-all">
                  <span>{val}</span>
                </div>
              )
            }
          </div>
        )
      }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:min-h-0 lg:h-full lg:pb-4 gap-4 h-full bg-gray-50 min-h-screen b-gray-50 pb-16">
            {/* Browser Section */}
            <div className="flex flex-col lg:col-span-1 bg-white rounded-lg shadow-sm p-3 md:p-4">
                <div className="grow">
                    {/*Title*/}
                    <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">{`${title}s`}</h2>
                    {/*Search Bar*/}
                    <form action={(fd: FormData) => {handleSearchT(fd)}}>
                      <label htmlFor="search">Search</label>
                      <input name="search" id="search"></input>
                      <select
                        name="filter"
                        id="filter"
                      >
                        <option value="">filter</option>
                        {sectionData[0] ?
                        Object.keys(sectionData[0]).map((key) => {
                          if (deps[key]){
                            return (
                              <option value={`${key}.${deps[key].dKey}`}>{key}</option>
                            )
                          } else {
                            return (
                              <option value={key}>{key}</option>
                            )
                          }
                        }) : 
                          <></>
                        }
                      </select>
                    </form>
                    <ul className="space-y-1 md:space-y-2">
                        {/*Item Selection*/}
                        {sectionData.map((entry: T) => (
                            <li
                                key={entry._id as string}
                                className={`p-2 md:p-3 rounded-lg cursor-pointer transition-colors text-sm md:text-base ${selectedEntry?._id === entry._id
                                        ? 'bg-blue-100 border-blue-500'
                                        : 'hover:bg-gray-100'
                                    }`}
                                onClick={() => setSelectedEntry(entry)}
                            >
                                <div className="font-medium relative">
                                    {(entry[displayKey as keyof T]) as string}
                                    {/*Delete Item Button*/}
                                    <ToolTip
                                        label="..."
                                        triggerClasses="float-right hover:bg-blue-500 px-2 rounded"
                                        containerClasses="bg-white p-1 rounded"
                                    >
                                        <>
                                            <button
                                                onClick={(ev) => {
                                                    handleDeleteT(entry._id as string)
                                                    ev.target.dispatchEvent(new Event('closettm'))
                                                }}
                                                className="hover:bg-blue-500 px-2 rounded closer"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    </ToolTip>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    {/*Add Item Button*/}
                    <Popup
                        label={`Add ${title}`}
                        triggerClasses="w-full rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm py-2"
                        containerClasses="bg-white w-[400px] p-2 rounded border"
                    >
                        <div>
                            <h2 className="text-lg">{`Add ${title}`}</h2>
                            <form className="closer" action="javascript:void(0);" onSubmit={(ev: FormEvent<HTMLFormElement>) => {
                                const item: HTMLInputElement = ev.currentTarget.elements.namedItem("pName") as HTMLInputElement
                                if (!item) return false
                                handleCreateT(item.value)
                                ev.target.dispatchEvent(new Event('closepm'))
                            }}>
                                <label htmlFor="rName">{`${title} Name:`}</label>
                                <input className="float-right border border-blue-500 rounded" type="text" id="pName" name="pName" /><br />
                                <div className="mt-6">
                                    <button
                                        className="text-white closer rounded px-2 py-1 bg-blue-600 hover:bg-blue-700"
                                        onClick={(ev) => {
                                            ev.target.dispatchEvent(new Event('closepm'))
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <input className="text-white cursor-pointer float-right bg-blue-600 hover:bg-blue-700 rounded px-2 py-1" type="submit" value="Submit" />
                                </div>
                            </form>
                        </div>
                    </Popup>
                    {/*Pagination*/}
                    <div>
                      {[...Array(numPages).keys()].map((item: number) => (
                        <a 
                          key={item}
                          className={`${pageNumber == item ? "text-blue-800 bg-gray-300" : "text-blue-700 hover:bg-gray-200"} px-1 cursor-pointer`}
                          onClick={() => {setPageNumber(item)}}
                        >{item + 1}</a>
                      ))}
                    </div>
                </div>
            </div>
            {/* Detail Viewer */}
            {selectedEntry ? (
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-4 md:p-6">
                    <div className="space-y-2 md:space-y-4">
                        <h2 className="text-lg md:text-xl font-semibold text-black-pearl-dark">{`${title} Details`}</h2>
                        <form action={handleSaveT}>
                            {Object.keys(selectedEntry).map(key => (
                                <Field key={key} fKey={key}/>
                            ))} 
                            <input type="submit" value="Save"/>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="lg:col-span-2 flex items-center justify-center text-gray-500 text-sm md:text-base p-4">
                    {`Select a ${title} to view details`}
                </div>
            )}
        </div>
    )
}
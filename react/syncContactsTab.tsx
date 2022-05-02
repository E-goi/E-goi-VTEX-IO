//react/adminExample.tsx
import React, { useEffect, useState } from 'react'
import {
  Layout,
  PageHeader,
  PageBlock,
  Alert,
  Dropdown,
  ButtonWithIcon,
  IconPlusLines,
  Spinner,
  Button,
  IconDelete } from 'vtex.styleguide'
import { useLazyQuery, useMutation, useQuery } from 'react-apollo'

import GET_EGOI_FIELDS from './graphql/getEgoiFields.graphql'
import GET_VTEX_FIELDS from './graphql/getVtexClientFields.graphql'
import GOIDINI_SYNC from './graphql/goidiniSync.graphql'
import GET_APP_SETTINGS from './graphql/appSettings.graphql'
import SAVE_APP_SETTINGS from './graphql/saveAppSettings.graphql'
import { FormattedMessage, useIntl } from 'react-intl'

export interface Fields {
  value: String
  label: String
}

const SyncContactsTab = () => {
  const intl = useIntl()
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [errorMessage, setErrorMessage] = useState('Error')
  const [successMessage, setSuccessMessage] = useState('Success')

  const [saveLoading, setSaveLoading] = useState(false)
  const [active, setActive] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [egoiFields, setEgoiFields] = useState<Array<Fields>>([])
  const [egoiFieldSelected, setEgoiFieldSelected] = useState<Fields>({ value: '', label: '' })
  const [vtexFields, setVtexFields] = useState<Array<Fields>>([])
  const [vtexFieldsSelected, setVtexFieldsSelected] = useState<Fields>({ value: '', label: '' })

  const [vtexFieldsMapped, setVtexFieldsMapped] = useState<Array<Fields>>([])
  const [egoiFieldsMapped, setEgoiFieldsMapped] = useState<Array<Fields>>([])

  const mapEgoiFieldsDropdown = async () => {
    try {
      if (getEgoiFields.getEgoiFields.length == 0) {
        //exception
      } else {

        let egoiFieldsFilter = getEgoiFields.getEgoiFields.filter((obj: any) => { return obj.type == 'extra' })

        let egoiFields = egoiFieldsFilter.length > 0 ?
          egoiFieldsFilter.map((obj: { name: string; field_id: string; type: string }) => (
            { value: obj.field_id, label: obj.name }
          )) : []

        setEgoiFields(egoiFields)
      }
    } catch (error) {
      console.log(error)
    } {
      setIsLoading(false)
    }
  }

  const mapVtexClientFieldsDropdown = () => {
    try {
      if (getVtexClientFields.getVtexClientFields.fields == 0) {
        //exception
      } else {

        let vtexClientFields = getVtexClientFields.getVtexClientFields.fields.map((obj: { name: string; displayName: string; type: string }) => (
          { value: obj.name, label: obj.displayName }
        ))

        setVtexFields(vtexClientFields)
      }
    } catch (error) {
      console.log(error)
    } {
      setIsLoading(false)
    }
  }

  const { data: getEgoiFields } = useQuery(GET_EGOI_FIELDS, {
    onCompleted: mapEgoiFieldsDropdown,
    onError: () => {
      setActive(false)
      setIsLoading(false)}
  })

  const { data: getVtexClientFields } = useQuery(GET_VTEX_FIELDS, {
    onCompleted: mapVtexClientFieldsDropdown,
    onError: () => {
      setActive(false)
      setIsLoading(false)}
  })

  const [appSettingsQuery, { data: appSettings }] = useLazyQuery(GET_APP_SETTINGS,
    {
      onCompleted: (() => {
        if (egoiFields.length != 0 && vtexFields.length != 0 && appSettings.getAppSettings.vtex && appSettings.getAppSettings.egoi) {
          let vtex: [string] = appSettings.getAppSettings.vtex
          let egoi: [string] = appSettings.getAppSettings.egoi

          vtex.map(
            (value, idx) => {
              let objVtex = vtexFields.find(x => x.value === value) ?? { value: '', label: '' }
              let objEgoi = egoiFields.find(x => x.value === egoi[idx]) ?? { value: '', label: '' }

              if (objVtex.value != '') {
                setEgoiFieldsMapped([...egoiFieldsMapped, objEgoi])
                setVtexFieldsMapped([...vtexFieldsMapped, objVtex])

                setEgoiFields(egoiFields.filter(field => field.value != objEgoi.value))
                setVtexFields(vtexFields.filter(field => field.value != objVtex.value))
              }
            })
        }
        setIsLoading(false)
      }),
      onError: () => {
        setIsLoading(false)
      }
    })

  useEffect(() => {
    if (egoiFields.length != 0) {
      appSettingsQuery()
    }

  }, [egoiFields])

  const [saveAppSettings] = useMutation(SAVE_APP_SETTINGS, {
    variables: {}
  })

  const [goidiniSync] = useMutation(GOIDINI_SYNC, {
    variables: {},
    onError: (e) => { 
      setSaveLoading(false)
      showError(intl.formatMessage({ id: 'admin/egoi-admin.errorMapping' }) + e.message) 
    },
    onCompleted: () => {
      let resp = saveAppSettings({
        variables: {
          vtex: vtexFieldsMapped ? vtexFieldsMapped.map(x => x.value) : appSettings.getAppSettings.vtex,
          egoi: egoiFieldsMapped ? egoiFieldsMapped.map(x => x.value) : appSettings.getAppSettings.egoi
        }
      });
      setSaveLoading(false)
      resp ? showSuccess(intl.formatMessage({ id: 'admin/egoi-admin.syncSuccess' })) : showError(intl.formatMessage({ id: 'admin/egoi-admin.syncError' }))
    }
  })

  const addFields = () => {
    setEgoiFieldsMapped([...egoiFieldsMapped, egoiFieldSelected])
    setVtexFieldsMapped([...vtexFieldsMapped, vtexFieldsSelected])

    setEgoiFields(egoiFields.filter(field => field.value != egoiFieldSelected.value))
    setVtexFields(vtexFields.filter(field => field.value != vtexFieldsSelected.value))

    setEgoiFieldSelected({ value: '', label: '' })
    setVtexFieldsSelected({ value: '', label: '' })
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setShowSuccessAlert(true)
  }

  const showError = (message: string) => {
    setErrorMessage(message)
    setShowErrorAlert(true)
  }

  const saveFields = () => {
    setSaveLoading(true)
    goidiniSync({
      variables: {
        vtex: vtexFieldsMapped.map(x => x.value),
        egoi: egoiFieldsMapped.map(x => x.value)
      }
    })
  }

  const removeFields = (idx: any) => {
    setEgoiFieldsMapped(egoiFieldsMapped.filter(field => field.value != egoiFieldsMapped[idx].value))
    setVtexFieldsMapped(vtexFieldsMapped.filter(field => field.value != vtexFieldsMapped[idx].value))

    setEgoiFields([...egoiFields, egoiFieldsMapped[idx]])
    setVtexFields([...vtexFields, vtexFieldsMapped[idx]])
  }

  return (
    <>
      {
        showErrorAlert ?
          <Alert type="error" onClose={() => setShowErrorAlert(false)}>
            {errorMessage}
          </Alert>
          :
          <></>
      }
      {
        showSuccessAlert ?
          <Alert type="success" onClose={() => setShowSuccessAlert(false)}>
            {successMessage}
          </Alert>
          :
          <></>
      }
      <Layout pageHeader={<PageHeader title="E-goi" />}>
        <PageBlock
          subtitle={<FormattedMessage id="admin/egoi-admin.configSync" />}
          variation="full">

          {
            isLoading ?
              <Spinner color="currentColor" size={20} />
              :
              active ?
              <div>
                <div>
                  <div>
                    <p><FormattedMessage id="admin/egoi-admin.syncFieldsText" /></p>
                  </div>

                  <div style={{ display: 'flex' }}>
                    <div style={{
                      width: "70%",
                      margin: "20px"
                    }}>
                      <Dropdown
                        label={<FormattedMessage id="admin/egoi-admin.vtexFields" />}
                        options={vtexFields}
                        value={vtexFieldsSelected.value}
                        onChange={(e: any) => {
                          let obj = vtexFields.find(x => x.value === e.target.value)
                          if (obj != undefined) {
                            setVtexFieldsSelected(obj)
                          }
                        }}
                      />
                      {vtexFieldsMapped.map(field => <p className="pa3 br2 bg-muted-5 hover-bg-muted-5 active-bg-muted-5 c-on-muted-5 hover-c-on-muted-5 active-c-on-muted-5 mr3" style={{ 'minHeight': '2rem', 'display': 'table' }}>{field.label}</p>)}
                    </div>
                    <div style={{
                      width: "70%",
                      margin: "20px"
                    }}>
                      <Dropdown
                        label={<FormattedMessage id="admin/egoi-admin.egoiFields" />}
                        options={egoiFields}
                        value={egoiFieldSelected.value}
                        onChange={(e: any) => {
                          let obj = egoiFields.find(x => x.value === e.target.value)
                          if (obj) {
                            setEgoiFieldSelected(obj)
                          }
                        }}
                      />
                      {egoiFieldsMapped.map(field => <p className="pa3 br2 bg-muted-5 hover-bg-muted-5 active-bg-muted-5 c-on-muted-5 hover-c-on-muted-5 active-c-on-muted-5 mr3" style={{ 'minHeight': '2rem', 'display': 'table' }}>{field.label}</p>)}
                    </div>
                    <div style={{ height: "10%", margin: "43px 0px 0px 0px" }}>
                      <ButtonWithIcon icon={<IconPlusLines />} variation="secondary" onClick={addFields} disabled={(egoiFields.length == 0 || vtexFields.length == 0)} />

                      {vtexFieldsMapped.map((_, idx) => <p>
                        <ButtonWithIcon
                          onClick={() => removeFields(idx)}
                          icon={<IconDelete />}
                          size="small"
                          variation="danger" />
                      </p>)}

                    </div>
                  </div>

                  <div style={{ padding: '20px', color: '#8a6d3b', background: '#fcf8e3' }}>
                    <p><FormattedMessage id="admin/egoi-admin.syncDefaultFieldsText" /></p>
                  </div>
                </div>
                <div className="mt5">
                  <span style={{ display: 'flex', justifyContent: 'flex-end', columnGap: '20px' }}>
                    <Button variation="secondary"
                      onClick={saveFields}
                      isLoading={saveLoading}> <FormattedMessage id="admin/egoi-admin.save" /></Button>
                  </span>
                </div>
              </div>
              :
              <div>
                <p><FormattedMessage id="admin/egoi-admin.configNeed" /></p>
              </div>
          }

        </PageBlock>
      </Layout>
    </>
  )
}

export default SyncContactsTab

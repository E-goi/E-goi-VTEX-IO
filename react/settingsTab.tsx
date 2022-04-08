//react/adminExample.tsx
import React, { useState } from 'react'
import { useQuery, useMutation } from 'react-apollo';
import {
  Layout,
  PageHeader,
  Spinner,
  PageBlock,
  Alert,
  Dropdown,
  Button,
  Input } from 'vtex.styleguide'

import GET_APP_SETTINGS from './graphql/appSettings.graphql'
import GET_MY_ACCOUNT from './graphql/myAccount.graphql'
import GET_LISTS from './graphql/getLists.graphql'
import SAVE_APP_SETTINGS from './graphql/saveAppSettings.graphql'
import GET_HOST from './graphql/hostName.graphql'
import GOIDINI_INSTALL from './graphql/goidiniInstall.graphql'
import { FormattedMessage, useIntl } from 'react-intl';


const SettingsTab = () => {
  const intl = useIntl()
  const [appTokenValue, setAppTokenValue] = useState('')
  const [appKeyValue, setAppKeyValue] = useState('')
  const [apikeyValue, setApikeyValue] = useState('')
  const [apikeyIsLoading, setApikeyIsLoading] = useState(false)
  const [listsOptions, setListsOptions] = useState([{}])
  const [listSelected, setListSelected] = useState(0)

  const [dropdown, setDropdown] = useState(true)
  const [disableConfigs, setDisableConfigs] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('Error')
  const [successMessage, setSuccessMessage] = useState('Success')
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)

  const { data: hostName } = useQuery(GET_HOST, { ssr: false })

  const { data: appSettings } = useQuery(GET_APP_SETTINGS,
    {
      ssr: false,
      onCompleted: (() => {
        setIsLoading(false)

        if (appSettings.getAppSettings.apikey) {
          setApikeyValue(appSettings.getAppSettings.apikey)
          setAppTokenValue(appSettings.getAppSettings.appToken)
          setAppKeyValue(appSettings.getAppSettings.appKey)

          setDisableConfigs(true)
        }
      })
    })

  const { data: myAccountData, refetch: refetchMyAccount } = useQuery(GET_MY_ACCOUNT, {
    variables: { apikey: apikeyValue }
  })

  const [goidiniInstall] = useMutation(GOIDINI_INSTALL, {
    variables: {},
    onError: (e) => { showError(intl.formatMessage({id: 'admin/egoi-admin.settingsError'})) + e.message },
    onCompleted: (e) => {
      if (e.goidiniInstall.status == 201) {

        let pixelActive = e.goidiniInstall.message ? false : true

        let resp = saveAppSettings({
          variables: {
            pixelActive: pixelActive,
            domain: appSettings.getAppSettings.domain ?? (hostName ? hostName.hostName : null),
            listId: listSelected,
            connectedSites: pixelActive,
            vtex: appSettings.getAppSettings.vtex ?? [],
            egoi: appSettings.getAppSettings.egoi ?? []
          }
        });

        resp ? showSuccess(intl.formatMessage({id: 'admin/egoi-admin.settingsSuccess'})) : showError(intl.formatMessage({id: 'admin/egoi-admin.settingsError'}))
      } else {
        showError(intl.formatMessage({id: 'admin/egoi-admin.settingsError'}) + e.goidiniInstall.message)
      }
    },
  })

  const [saveAppSettings] = useMutation(SAVE_APP_SETTINGS, {
    variables: {},
    onError: (e) => { console.log(e) }
  })

  const handleChangeApiKeyValue = (e: any) => {
    setApikeyValue(e.target.value)
  }

  const mapListsDropdown = async () => {
    try {
      if (getLists.getLists.total_items == 0) {
        //exception
      } else {

        let lists = getLists.getLists.items.map((obj: { list_id: any; public_name: any; }) => ({ value: obj.list_id, label: obj.public_name }))

        setListsOptions(lists)
        appSettings.getAppSettings.listId ? setListSelected(parseInt(appSettings.getAppSettings.listId)) : setListSelected(parseInt(lists[0].value))
      }
    } catch (error) {
      console.log(error)
    } {
      setDropdown(false)
    }
  }

  const { data: getLists, refetch: refetchGetLists } = useQuery(GET_LISTS, {
    variables: { apikey: apikeyValue },
    onCompleted: mapListsDropdown
  })

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setShowSuccessAlert(true)
  }

  const showError = (message: string) => {
    setErrorMessage(message)
    setShowErrorAlert(true)
  }

  const submitApikey = async () => {
    try {

      await refetchMyAccount()

      if (myAccountData.myAccount.general_info.client_id) {
        await refetchGetLists()
      }
    } catch (err) {
      return false
    }

    return true
  }


  const saveSettings = async () => {

    setApikeyIsLoading(true)
    let submit = await submitApikey()

    if (!submit) {
      showError(intl.formatMessage({id: 'admin/egoi-admin.errorApikey'}))
      appSettings.getAppSettings.apikey ? setApikeyValue(appSettings.getAppSettings.apikey) : setApikeyValue('')
      listsOptions ? setListsOptions(listsOptions) : setListsOptions([{}])
      appSettings.getAppSettings.listId ? setListSelected(appSettings.getAppSettings.listId) : setListSelected(0)
      setDisableConfigs(true) // se houver gravadas appSettings
      setApikeyIsLoading(false)
      return
    }


    //chamar pedido para validar key e token

    let resp = saveAppSettings({
      variables: {
        appKey: appKeyValue,
        appToken: appTokenValue,
        apikey: apikeyValue,
        clientId: myAccountData.myAccount.general_info.client_id ? parseInt(myAccountData.myAccount.general_info.client_id) : 0,
      }
    });

    if (resp) {
      setShowSuccessAlert(true)
      setDisableConfigs(true)
      setApikeyIsLoading(false)
    } else {
      setShowErrorAlert(true)
      setApikeyIsLoading(false)
    }
  }

  const saveListConfigs = async () => {

    if (listSelected == 0) {
      setShowErrorAlert(true)
      return
    }

    goidiniInstall({
      variables: {
        domain: appSettings.getAppSettings.domain ?? (hostName ? hostName.hostName : null),
        listId: listSelected
      }
    })
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
          subtitle={<FormattedMessage id="admin/egoi-admin.egoiSettings"/>}
          variation="full">
          {
            isLoading ? <Spinner color="currentColor" size={20} />
              :
              <div>
                <div className="mb5">
                  <Input
                    placeholder={<FormattedMessage id="admin/egoi-admin.insertAppKey"/>}
                    size="regular"
                    label="AppKey"
                    value={appKeyValue}
                    onChange={
                      (e: any) => {
                        setAppKeyValue(e.target.value)
                      }
                    }
                    disabled={disableConfigs}
                  />
                </div>
                <div className="mb5">
                  <Input
                    placeholder={<FormattedMessage id="admin/egoi-admin.insertAppToken"/>}
                    size="regular"
                    label="AppToken"
                    value={appTokenValue}
                    onChange={
                      (e: any) => {
                        setAppTokenValue(e.target.value)
                      }
                    }
                    disabled={disableConfigs}
                  />
                </div>
                <div className="mb5">
                  <Input
                    placeholder={<FormattedMessage id="admin/egoi-admin.insertApikey"/>}
                    size="regular"
                    label="Apikey"
                    value={apikeyValue}
                    onChange={
                      (e: any) => handleChangeApiKeyValue(e)
                    }
                    isLoading={apikeyIsLoading}
                    disabled={disableConfigs}
                  />
                </div>
                <span className="mb4" style={{ display: 'flex', justifyContent: 'flex-end', columnGap: '20px' }} >
                  <Button variation="secondary"
                    onClick={saveSettings}
                    disabled={disableConfigs}><FormattedMessage id="admin/egoi-admin.save"/></Button>
                  <Button variation="secondary"
                    onClick={() => setDisableConfigs(false)}><FormattedMessage id="admin/egoi-admin.edit"/></Button>
                </span>
              </div>
          }
        </PageBlock>

        <PageBlock
          variation="full"
        >
          <div className="mb5">
            <Dropdown
              disabled={dropdown}
              label={<FormattedMessage id="admin/egoi-admin.lists"/>}
              options={listsOptions}
              value={listSelected}
              isLoading={apikeyIsLoading}
              onChange={(e: any) => {
                setListSelected(parseInt(e.target.value))
              }}
            />
          </div>
          <span className="mb4" style={{ display: 'flex', justifyContent: 'flex-end', columnGap: '20px' }}>
            <Button variation="secondary"
              onClick={saveListConfigs}
              disabled={dropdown}><FormattedMessage id="admin/egoi-admin.save"/></Button>
          </span>
        </PageBlock>

      </Layout>
    </>
  )
}

export default SettingsTab

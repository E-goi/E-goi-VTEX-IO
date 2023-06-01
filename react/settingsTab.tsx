// react/adminExample.tsx
import React, { useEffect, useState } from 'react'
import { useQuery, useMutation, useLazyQuery } from 'react-apollo'
import {
  Layout,
  PageHeader,
  Spinner,
  PageBlock,
  Alert,
  Dropdown,
  Button,
  Input,
} from 'vtex.styleguide'
import { FormattedMessage, useIntl } from 'react-intl'

import GET_APP_SETTINGS from './graphql/appSettings.graphql'
import GET_MY_ACCOUNT from './graphql/myAccount.graphql'
import GET_LISTS from './graphql/getLists.graphql'
import SAVE_APP_SETTINGS from './graphql/saveAppSettings.graphql'
import GET_HOST from './graphql/hostName.graphql'
import GOIDINI_INSTALL from './graphql/goidiniInstall.graphql'

const SettingsTab = () => {
  const intl = useIntl()
  const [appTokenValue, setAppTokenValue] = useState('')
  const [appKeyValue, setAppKeyValue] = useState('')
  const [apikeyValue, setApikeyValue] = useState('')
  // const [apikeyIsLoading, setApikeyIsLoading] = useState(false)
  const [saveSettingsLoading, setSaveSettingsLoading] = useState(false)
  const [listsOptions, setListsOptions] = useState([{}])
  const [listSelected, setListSelected] = useState(0)

  const [dropdown, setDropdown] = useState(true)
  const [disableConfigs, setDisableConfigs] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('Error')
  const [successMessage, setSuccessMessage] = useState('Success')
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)

  useEffect(() => {
    // seu código aqui
  }, [])
  
  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setShowSuccessAlert(true)
  }

  const showError = (message: string) => {
    setErrorMessage(message)
    setShowErrorAlert(true)
  }

  const [saveAppSettings] = useMutation(SAVE_APP_SETTINGS, {
    variables: {},
    onError: () => {
      showError(intl.formatMessage({ id: 'admin/egoi-admin.errorApikey' }))
    },
  })

  const { data: hostName } = useQuery(GET_HOST, { ssr: false })

  const { data: appSettings } = useQuery(GET_APP_SETTINGS, {
    ssr: false,
    onCompleted: () => {
      setIsLoading(false)

      console.log("TESTE")
      console.log(appSettings.getAppSettings)


      if (appSettings.getAppSettings.apikey) {
        //validar se settings existem e se são válidos


        setApikeyValue(appSettings.getAppSettings.apikey)
        setAppTokenValue(appSettings.getAppSettings.appToken)
        setAppKeyValue(appSettings.getAppSettings.appKey)

        setDisableConfigs(true)
      }
    },
  })

  const mapListsDropdown = async () => {
    try {
      if (getLists.getLists.total_items === 0) {
        // exception
      } else {
        const lists = getLists.getLists.items.map(
          (obj: { list_id: any; public_name: any }) => ({
            value: obj.list_id,
            label: obj.public_name,
          })
        )

        setListsOptions(lists)
        appSettings.getAppSettings.listId
          ? setListSelected(parseInt(appSettings.getAppSettings.listId, 10))
          : setListSelected(parseInt(lists[0].value, 10))
      }
    } catch (e) {
      showError(
        `${intl.formatMessage({ id: 'admin/egoi-admin.errorApikey' })}${
          e.message
        }`
      )
    }

    {
      setSaveSettingsLoading(false)
      setDropdown(false)
      setDisableConfigs(false)
    }
  }

  const { data: getLists, refetch: refetchGetLists } = useQuery(GET_LISTS, {
    variables: {
      apikey: apikeyValue,
    },
    onCompleted: mapListsDropdown,
  })

  const [myaccount, { data: myAccountData }] = useLazyQuery(GET_MY_ACCOUNT, {
    onCompleted: () => {
      if (myAccountData) {
        if (myAccountData.myAccount.general_info.client_id) {
          refetchGetLists()
        }
      }
    },
    onError: () => {
      showError(intl.formatMessage({ id: 'admin/egoi-admin.errorApikey' }))
      appSettings.getAppSettings.apikey
        ? setApikeyValue(appSettings.getAppSettings.apikey)
        : setApikeyValue('')
      listsOptions ? setListsOptions(listsOptions) : setListsOptions([{}])
      appSettings.getAppSettings.listId
        ? setListSelected(appSettings.getAppSettings.listId)
        : setListSelected(0)
      setSaveSettingsLoading(false)
      setDisableConfigs(false)
    },
  })

  const [goidiniInstall] = useMutation(GOIDINI_INSTALL, {
    variables: {},
    onError: (e) => {
      showError(
        `${intl.formatMessage({ id: 'admin/egoi-admin.settingsError' })}${
          e.message
        }`
      )
      setSaveSettingsLoading(false)
      setDisableConfigs(false)
    },
    onCompleted: (e) => {
      if (e.goidiniInstall.status === 200 || e.goidiniInstall.status === 20) {
        const pixelActive = !e.goidiniInstall.message

        const resp = saveAppSettings({
          variables: {
            appKey: appKeyValue,
            appToken: appTokenValue,
            apikey: apikeyValue,
            clientId: myAccountData.myAccount.general_info.client_id
              ? parseInt(myAccountData.myAccount.general_info.client_id, 10)
              : 0,
            pixelActive,
            domain:
              appSettings.getAppSettings.domain ??
              (hostName ? hostName.hostName : null),
            listId: listSelected,
            connectedSites: pixelActive,
            vtex: appSettings.getAppSettings.vtex ?? [],
            egoi: appSettings.getAppSettings.egoi ?? [],
          },
        })

        resp
          ? showSuccess(
              intl.formatMessage({ id: 'admin/egoi-admin.settingsSuccess' })
            )
          : showError(
              intl.formatMessage({ id: 'admin/egoi-admin.settingsError' })
            )
      } else {
        showError(
          `${intl.formatMessage({ id: 'admin/egoi-admin.settingsError' })}${
            e.goidiniInstall.message
          }`
        )
      }

      setSaveSettingsLoading(false)
      setDisableConfigs(false)
    },
  })

  const handleChangeApiKeyValue = async (e: any) => {
    setApikeyValue(e.target.value)

    if (e.target.value.length === 40) {
      setSaveSettingsLoading(true)
      setDisableConfigs(true)
      myaccount({ variables: { apikey: e.target.value } })
    }
  }

  const saveSettings = async () => {
    setDisableConfigs(true)
    setSaveSettingsLoading(true)

    if (
      apikeyValue === '' &&
      appKeyValue === '' &&
      appTokenValue === '' &&
      listSelected === 0
    ) {
      setShowErrorAlert(true)
      setSaveSettingsLoading(false)

      return
    }

    goidiniInstall({
      variables: {
        apikey: apikeyValue,
        appkey: appKeyValue,
        apptoken: appTokenValue,
        domain:
          appSettings.getAppSettings.domain ??
          (hostName ? hostName.hostName : null),
        listId: listSelected,
      },
    })
  }

  return (
    <>
      {showErrorAlert ? (
        <Alert type="error" onClose={() => setShowErrorAlert(false)}>
          {errorMessage}
        </Alert>
      ) : (
        <></>
      )}
      {showSuccessAlert ? (
        <Alert type="success" onClose={() => setShowSuccessAlert(false)}>
          {successMessage}
        </Alert>
      ) : (
        <></>
      )}
      <Layout pageHeader={<PageHeader title="E-goi" />}>
        <PageBlock
          subtitle={<FormattedMessage id="admin/egoi-admin.egoiSettings" />}
          variation="full"
        >
          {isLoading ? (
            <Spinner color="currentColor" size={20} />
          ) : (
            <div>
              <div className="mb5">
                <Input
                  label={
                    <FormattedMessage id="admin/egoi-admin.insertAppKey" />
                  }
                  size="regular"
                  placeholder="AppKey"
                  value={appKeyValue}
                  onChange={(e: any) => {
                    setAppKeyValue(e.target.value)
                  }}
                  disabled={disableConfigs}
                />
              </div>
              <div className="mb5">
                <Input
                  label={
                    <FormattedMessage id="admin/egoi-admin.insertAppToken" />
                  }
                  size="regular"
                  placeholder="AppToken"
                  value={appTokenValue}
                  onChange={(e: any) => {
                    setAppTokenValue(e.target.value)
                  }}
                  disabled={disableConfigs}
                />
              </div>
              <div className="mb5">
                <Input
                  label={
                    <FormattedMessage id="admin/egoi-admin.insertApikey" />
                  }
                  size="regular"
                  placeholder="Apikey"
                  value={apikeyValue}
                  onChange={(e: any) => handleChangeApiKeyValue(e)}
                  disabled={disableConfigs}
                />
              </div>

              <div className="mt5 mb5">
                <Dropdown
                  disabled={dropdown}
                  label={intl.formatMessage({id: 'admin/egoi-admin.lists'}) }
                  options={listsOptions}
                  value={listSelected}
                  onChange={(e: any) => {
                    setListSelected(parseInt(e.target.value, 10))
                  }}
                />
              </div>

              <div
                style={{
                  padding: '20px',
                  color: '#8a6d3b',
                  background: '#fcf8e3',
                }}
              >
                <p>
                  <FormattedMessage id="admin/egoi-admin.legacy1" />
                  <a target="_blank" href="https://www.e-goi.com/pt/vtex">
                    <FormattedMessage id="admin/egoi-admin.legacy2" />
                  </a>
                  <FormattedMessage id="admin/egoi-admin.legacy3" />
                </p>
              </div>

              <span
                className="mt4 mb4"
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  columnGap: '20px',
                }}
              >
                <Button
                  variation="secondary"
                  onClick={saveSettings}
                  isLoading={saveSettingsLoading}
                >
                  <FormattedMessage id="admin/egoi-admin.save" />
                </Button>
              </span>
            </div>
          )}
        </PageBlock>
      </Layout>
    </>
  )
}

export default SettingsTab

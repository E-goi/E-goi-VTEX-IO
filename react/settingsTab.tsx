// react/adminExample.tsx
import React, { useState } from 'react'
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
import GOIDINI_SETTINGS from './graphql/goidiniSettings.graphql'
import GET_LISTS from './graphql/getLists.graphql'
import SAVE_APP_SETTINGS from './graphql/saveAppSettings.graphql'
import GET_HOST from './graphql/hostName.graphql'
import GOIDINI_INSTALL from './graphql/goidiniInstall.graphql'

const SettingsTab = () => {
  const intl = useIntl()
  const [appTokenValue, setAppTokenValue] = useState('')
  const [appKeyValue, setAppKeyValue] = useState('')
  const [apikeyValue, setApikeyValue] = useState('')

  const [handledApikey, setHandledApikey] = useState(false)
  const [saveSettingsLoading, setSaveSettingsLoading] = useState(false)
  const [listsOptions, setListsOptions] = useState([{}])
  const [listSelected, setListSelected] = useState(0)

  const [apikeyError, setApikeyError] = useState(false)
  const [appKeyError, setAppKeyError] = useState(false)
  const [appTokenError, setAppTokenError] = useState(false)

  const [dropdown, setDropdown] = useState(true)
  const [disableConfigs, setDisableConfigs] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('Error')
  const [successMessage, setSuccessMessage] = useState('Success')
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)

  const [skip, setSkip] = useState(false)
  
  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setShowSuccessAlert(true)
  }

  const showError = (message: string) => {
    setErrorMessage(message)
    setShowErrorAlert(true)
  }

  /**
   * Save App Settings Mutation
   */
  const [saveAppSettings] = useMutation(SAVE_APP_SETTINGS, {
    context:{
      setTimeout: 10000
    },
    variables: {},
    onError: () => {
      showError(intl.formatMessage({ id: 'admin/egoi-admin.errorApikey' }))
    },
  })

  /**
   * Get Host Name Query
   */
  const { data: hostName } = useQuery(GET_HOST, { ssr: false })

  /**
   * Get App Settings Query
   */
  const { data: appSettings } = useQuery(GET_APP_SETTINGS, {
    onCompleted: () => {
      if (appSettings && appSettings.getAppSettings.apikey != '') {

        setApikeyValue(appSettings.getAppSettings.apikey)
        //validar se settings existem e se são válidos
        goidiniSettings()
      }
    },
    onError: () => {
      console.log('erro')
    }
  })

  /**
   * Get Goidini Settings Query
   */
    const [goidiniSettings, { data: goidiniSettingsData }] = useLazyQuery(GOIDINI_SETTINGS, {
      fetchPolicy: 'network-only',
      variables: {
        apikey: apikeyValue ? apikeyValue : ''
      },
      onCompleted: () => {
        if(!skip){

          if ( goidiniSettingsData && goidiniSettingsData.goidiniSettings.status === 200) {
            setApikeyError(false)

            if(apikeyValue == '' && appSettings.getAppSettings.apikey != ''){
              myaccount({ variables: { apikey: appSettings.getAppSettings.apikey } })
              setApikeyValue(appSettings.getAppSettings.apikey)
            } else {
              setApikeyValue(apikeyValue)
            }

            setApikeyValue(apikeyValue)
            setAppKeyValue(goidiniSettingsData.goidiniSettings.message.vtexAppKey)
            setAppTokenValue(goidiniSettingsData.goidiniSettings.message.vtexAppToken)
            setListSelected(goidiniSettingsData.goidiniSettings.message.listId)
            
            if(goidiniSettingsData.goidiniSettings.message.vtexAppKey != '' && goidiniSettingsData.goidiniSettings.message.vtexAppToken != '' 
            && goidiniSettingsData.goidiniSettings.message.listId != 0 && apikeyValue != '' && myAccountData ){
              saveAppSettings({
                variables: {
                  appKey: goidiniSettingsData.goidiniSettings.message.vtexAppKey,
                  appToken: goidiniSettingsData.goidiniSettings.message.vtexAppToken,
                  apikey: apikeyValue,
                  clientId: myAccountData.myAccount.general_info.client_id
                    ? parseInt(myAccountData.myAccount.general_info.client_id, 10)
                    : 0,
                  domain: (hostName ? hostName.hostName : null),
                  listId: goidiniSettingsData.goidiniSettings.message.listId
                },
              })
            } 
            
             setDisableConfigs(false)
          } else{
            if(goidiniSettingsData && goidiniSettingsData.goidiniSettings.status != 404){

              setApikeyValue('')
              setAppKeyValue('')
              setAppTokenValue('')
              setListSelected(0)
              setDropdown(true)
            } else if(goidiniSettingsData && goidiniSettingsData.goidiniSettings.status == 404 && !handledApikey) {
              setApikeyValue('')
              setListSelected(0)
              setDropdown(true)

              // Retry because api da vtex tem falhas
              try{
                saveAppSettings({
                  variables: {
                    appKey: '',
                    appToken: '',
                    apikey: ''
                  },
                })
              }catch(e){
                saveAppSettings({
                  variables: {
                    appKey: '',
                    appToken: '',
                    apikey: ''
                  },
                })
              }

            }
          }

          setSkip(true)
          setIsLoading(false)
        }

      },
      onError: () => {
          setApikeyValue('')   
          setAppKeyValue('')
          setAppTokenValue('')
          setListSelected(0)

          setIsLoading(false)
          setDisableConfigs(false)
          setSkip(true)

      },
    })

  /**
   * Map Lists Dropdown
   */
  const mapListsDropdown = async () => {
    try {
      if (getLists.getLists.total_items === 0) {
        // exception
      } else {
        setDropdown(false)
        const lists = getLists.getLists.items.map(
          (obj: { list_id: any; public_name: any }) => ({
            value: obj.list_id,
            label: obj.public_name,
          })
        )

        setListsOptions(lists)

        if(listSelected == 0){
          setListSelected(parseInt(lists[0].value, 10))
        }
        
        setSkip(false)
        setIsLoading(true)
        goidiniSettings()
        

      }
    } catch (e) {
      setIsLoading(false)
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

  /**
   * Get Lists Query
   */
  const { data: getLists, refetch: refetchGetLists } = useQuery(GET_LISTS, {
    variables: {
      apikey: apikeyValue,
    },
    onCompleted: mapListsDropdown,
    onError: () => {
        setIsLoading(false)
    }
  })

  /**
   * Get My Account Query
   */
  const [myaccount, { data: myAccountData }] = useLazyQuery(GET_MY_ACCOUNT, {
    onCompleted: () => {
      if (myAccountData) {
        if (myAccountData.myAccount.general_info.client_id) {
          setApikeyError(false)
          refetchGetLists()
        }
      }
    },
    onError: () => {
      setIsLoading(false)
      setApikeyError(true)
      setSaveSettingsLoading(false)
      setDisableConfigs(false)

      setListsOptions([{}])
      setListSelected(0)
      setDropdown(false)

    },
  })

  /**
   * Goidini Install Mutation
   */
  const [goidiniInstall] = useMutation(GOIDINI_INSTALL, {
    variables: {},
    context:{
      setTimeout: 10000
    },
    onError: (e) => {

      if(e.message == 'GraphQL error: timeout of 800ms exceeded'){
        let resp = saveAppSettings({
          variables: {
            appKey: appKeyValue,
            appToken: appTokenValue,
            apikey: apikeyValue,
            clientId: myAccountData.myAccount.general_info.client_id
              ? parseInt(myAccountData.myAccount.general_info.client_id, 10)
              : 0,
            domain: (hostName ? hostName.hostName : null),
            listId: listSelected,
            connectedSites: true
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
            e.message
          }`
        )
      }

      setSaveSettingsLoading(false)
      setDisableConfigs(false)
    },
    onCompleted: (e) => {
      if (e.goidiniInstall.status === 200 || e.goidiniInstall.status === 20) {
        const pixelActive = !e.goidiniInstall.message

        let resp = saveAppSettings({
          variables: {
            appKey: appKeyValue,
            appToken: appTokenValue,
            apikey: apikeyValue,
            clientId: myAccountData.myAccount.general_info.client_id
              ? parseInt(myAccountData.myAccount.general_info.client_id, 10)
              : 0,
            pixelActive,
            domain: (hostName ? hostName.hostName : null),
            listId: listSelected,
            connectedSites: pixelActive
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

  /**
   * Handle apikey change
   * @param e 
   */
  const handleChangeApiKeyValue = async (e: any) => {
    setApikeyValue(e.target.value)
    setApikeyError(false)
    setDropdown(true)

    if (e.target.value.length === 40) {
      setHandledApikey(true)
      setSaveSettingsLoading(true)
      setDisableConfigs(false)
      myaccount({ variables: { apikey: e.target.value } })
    }
  }

  /**
   * Function to validate settings to save
   * @returns 
   */
  const saveSettings = async () => {
    setDisableConfigs(true)
    setSaveSettingsLoading(true)

    if (apikeyValue === '') {
      setApikeyError(true)
    }

    if (appKeyValue === '') {
      setAppKeyError(true)
    } else {
      setAppKeyError(false)
    }

    if (appTokenValue === '') {
      setAppTokenError(true)
    } else {
      setAppTokenError(false)
    }
    

    //checkar errors
    if (
      apikeyValue === '' ||
      appKeyValue === '' ||
      appTokenValue === '' ||
      listSelected === 0
    ) {
      setErrorMessage(intl.formatMessage({ id: 'admin/egoi-admin.saveRequiredFieldsError' }))
      setShowErrorAlert(true)
      setSaveSettingsLoading(false)
      setDisableConfigs(false)

      return
    }

    goidiniInstall({
      variables: {
        apikey: apikeyValue,
        appkey: appKeyValue,
        apptoken: appTokenValue,
        domain: (hostName ? hostName.hostName : null),
        listId: listSelected,
      },
    })
  }

  return (
    <>
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
                    <FormattedMessage id="admin/egoi-admin.insertApikey" />
                  }
                  size="regular"
                  placeholder="Apikey"
                  value={apikeyValue}
                  onChange={(e: any) => handleChangeApiKeyValue(e)}
                  disabled={disableConfigs}
                  maxLength={40}
                  minLength={40}
                  error={apikeyError}
                  required={true}
                />
              </div>

              <div className="mt5 mb5">
                <Dropdown
                  disabled={dropdown || apikeyError}
                  label={intl.formatMessage({id: 'admin/egoi-admin.lists'}) }
                  options={listsOptions}
                  value={listSelected}
                  required={true}
                  onChange={(e: any) => {
                    setListSelected(parseInt(e.target.value, 10))
                  }}
                />
              </div>
              
              <div className="mb5" hidden={!apikeyValue || apikeyError|| dropdown } >
                <Input
                  label={
                    <FormattedMessage id="admin/egoi-admin.insertAppKey" />
                  }
                  size="regular"
                  placeholder="AppKey"
                  value={appKeyValue}
                  error={appKeyError}
                  onChange={(e: any) => {
                    setAppKeyValue(e.target.value)
                  }}
                  required={true}
                  disabled={disableConfigs}
                />
              </div>
              <div className="mb5" hidden={!apikeyValue || apikeyError || dropdown}>
                <Input
                  label={
                    <FormattedMessage id="admin/egoi-admin.insertAppToken" />
                  }
                  size="regular"
                  placeholder="AppToken"
                  value={appTokenValue}
                  required={true}
                  error={appTokenError}
                  onChange={(e: any) => {
                    setAppTokenValue(e.target.value)
                  }}
                  disabled={disableConfigs}
                />
              </div>

              <div>
                <p>
                  {showErrorAlert ? (
                    <Alert type="error" focusOnOpen={true}  autoClose={10000}  onClose={() => setShowErrorAlert(false)}>
                      {errorMessage}
                    </Alert>
                  ) : (
                    <></>
                  )}
                  {showSuccessAlert ? (
                    <Alert type="success" focusOnOpen={true}  autoClose={10000} onClose={() => setShowSuccessAlert(false)}>
                      {successMessage}
                    </Alert>
                  ) : (
                    <></>
                  )}
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
                  disabled={apikeyError || apikeyValue.length != 40  }
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

//react/adminExample.tsx
import React, { useState } from 'react'
import { useQuery, useMutation } from 'react-apollo';
import { Layout, PageHeader, PageBlock, Toggle, Input, Button, Spinner, Alert } from 'vtex.styleguide'

import GET_APP_SETTINGS from './graphql/appSettings.graphql'
import SAVE_APP_SETTINGS from './graphql/saveAppSettings.graphql'
import CREATE_CONNECTED_SITES from './graphql/createConnectedSites.graphql'

import GET_HOST from './graphql/hostName.graphql'
import { FormattedMessage, useIntl } from 'react-intl';

const ConnectedSitesTab = () => {
  const intl = useIntl()
  const [connectedSites, setConnectedSites] = useState(false)
 
  const [errorMessage, setErrorMessage] = useState('Error')
  const [successMessage, setSuccessMessage] = useState('Success')
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { data: hostName } = useQuery(GET_HOST,
    {
      ssr: false,
      onError: () => {
        showError(intl.formatMessage({id: 'admin/egoi-admin.csErrorStore'}))
      }
    })

  const { data: appSettings, loading: appSettingsLoading } = useQuery(GET_APP_SETTINGS)

  const [saveAppSettings] = useMutation(SAVE_APP_SETTINGS, {
    variables: {},
    onError: () => {
      showError(intl.formatMessage({id: 'admin/egoi-admin.csError'}))
    }
  })

  const [createConnectedSites] = useMutation(CREATE_CONNECTED_SITES, {
    onError: (e) => showError(intl.formatMessage({id: 'admin/egoi-admin.csErrorCreate'}) + e.message),
    onCompleted: (e) => {
      if (e.createConnectedSites.status == 200) {
        showSuccess(intl.formatMessage({id: 'admin/egoi-admin.csSuccess'}))
        saveAppSettings({
          variables: {
            pixelActive: connectedSites,
            connectedSites: true
          }
        });
      } else {
        showError(intl.formatMessage({id: 'admin/egoi-admin.csErrorCreate'}) + e.createConnectedSites.message)
        setConnectedSites(false)
      }
    }
  })

  const saveSettings = async () => {
    setIsLoading(true)
    try {
      if (!appSettings.getAppSettings.connectedSites) {
        createConnectedSites()
      } else {
        saveAppSettings({
          variables: {
            pixelActive: connectedSites,
            connectedSites: appSettings.getAppSettings.connectedSites
          }
        });
    
        showSuccess(intl.formatMessage({id: 'admin/egoi-admin.csSuccess'}))
      }
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      showError(intl.formatMessage({id: 'admin/egoi-admin.csErrorActivate'}) + error)
    }

  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setShowSuccessAlert(true)
  }

  const showError = (message: string) => {
    setErrorMessage(message)
    setShowErrorAlert(true)
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
          subtitle={<FormattedMessage id="admin/egoi-admin.configConnectedSites"/>}
          variation="full">
          {
            appSettingsLoading ? <Spinner color="currentColor" size={20} />
              : <div>
                <p><FormattedMessage id="admin/egoi-admin.csText1"/></p>
                <p><FormattedMessage id="admin/egoi-admin.csText2"/></p>

                <span><FormattedMessage id="admin/egoi-admin.csText3"/><a target="_blank" href="https://helpdesk.e-goi.com/262312-Connected-Sites-What-is-it-and-how-do-I-use-it"><FormattedMessage id="admin/egoi-admin.csHere"/></a>.</span>

                <div className="mt8">
                  <h4 className="t-heading-5 mt0"> <FormattedMessage id="admin/egoi-admin.activateConnectedSites"/> </h4>
                  <Toggle
                    label={connectedSites ? <FormattedMessage id="admin/egoi-admin.activated"/>  : <FormattedMessage id="admin/egoi-admin.deactivated"/>}
                    semantic
                    checked={connectedSites}
                    onChange={() => {
                      setConnectedSites(!connectedSites)
                    }}
                  />
                </div>

                <div className="mt8" hidden={!connectedSites}>
                  <h4 className="t-heading-5 mt0"> <FormattedMessage id="admin/egoi-admin.domain"/> </h4>
                  <Input
                    value={hostName ? hostName.hostName : appSettings.getAppSettings.domain}
                    readOnly={true}
                    label={<FormattedMessage id="admin/egoi-admin.domainLabel"/>}
                  />
                </div>

                <div className="mt5">
                  <span style={{ display: 'flex', justifyContent: 'flex-end', columnGap: '20px' }}>
                    <Button variation="secondary"
                      onClick={saveSettings}
                      isLoading={isLoading}><FormattedMessage id="admin/egoi-admin.save"/></Button>
                  </span>
                </div>
              </div>
          }
        </PageBlock>
      </Layout>
    </>
  )
}

export default ConnectedSitesTab

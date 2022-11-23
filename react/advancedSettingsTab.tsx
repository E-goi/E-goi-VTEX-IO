// react/adminExample.tsx
import React, { useState } from 'react'
import { useQuery } from 'react-apollo'
import {
  Layout,
  PageHeader,
  PageBlock,
  Button,
  Spinner,
  Divider,
} from 'vtex.styleguide'
import { FormattedMessage } from 'react-intl'

import GET_APP_SETTINGS from './graphql/appSettings.graphql'

const AdvancedSettingsTab = () => {
  const [active, setActive] = useState(true)

  const [isLoading] = useState(false)

  const { data: appSettings, loading: appSettingsLoading } = useQuery(
    GET_APP_SETTINGS,
    {
      onCompleted: () => {
        if (!appSettings.getAppSettings.apikey) {
          setActive(false)
        }
      },
      onError: () => setActive(false),
    }
  )

  return (
    <>
      <Layout pageHeader={<PageHeader title="E-goi" />}>
        <PageBlock
          subtitle={
            <FormattedMessage id="admin/egoi-admin.configAdvancedSettings" />
          }
          variation="full"
        >
          {appSettingsLoading ? (
            <Spinner color="currentColor" size={20} />
          ) : active ? (
            <div>
              <div>
                <p>
                  <FormattedMessage id="admin/egoi-admin.asText1" />
                </p>
                <p>
                  <FormattedMessage id="admin/egoi-admin.asText2" />
                </p>
              </div>

              <div className="mt8 mb8 flex">
                <div className="w-40">
                  <h2 className="mt0 mb6">
                    <FormattedMessage id="admin/egoi-admin.asFeatHeader1" />
                  </h2>
                  <p className="f6 gray ma0">
                    <FormattedMessage id="admin/egoi-admin.asFeat1" />
                  </p>
                </div>
                <div
                  style={{ flexGrow: 1 }}
                  className="flex items-stretch w-20 justify-center"
                >
                  <Divider orientation="vertical" />
                </div>
                <div className="w-40">
                  <h2 className="mt0 mb6">
                    <FormattedMessage id="admin/egoi-admin.asFeatHeader2" />
                  </h2>
                  <p className="f6 gray ma0">
                    <FormattedMessage id="admin/egoi-admin.asFeat2" />
                  </p>
                </div>
                <div
                  style={{ flexGrow: 1 }}
                  className="flex items-stretch w-20 justify-center"
                >
                  <Divider orientation="vertical" />
                </div>
                <div className="w-40">
                  <h2 className="mt0 mb6">
                    <FormattedMessage id="admin/egoi-admin.asFeatHeader3" />
                  </h2>
                  <p className="f6 gray ma0">
                    <FormattedMessage id="admin/egoi-admin.asFeat3" />
                  </p>
                </div>
                <div
                  style={{ flexGrow: 1 }}
                  className="flex items-stretch w-20 justify-center"
                >
                  <Divider orientation="vertical" />
                </div>
                <div className="w-40">
                  <h2 className="mt0 mb6">
                    <FormattedMessage id="admin/egoi-admin.asFeatHeader4" />
                  </h2>
                  <p className="f6 gray ma0">
                    <FormattedMessage id="admin/egoi-admin.asFeat4" />
                  </p>
                </div>
              </div>

              <div className="mt5">
                <span
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    columnGap: '20px',
                  }}
                >
                  <Button
                    variation="secondary"
                    isLoading={isLoading}
                    href="https://goidini.e-goi.com/index/list"
                    target="_blank"
                  >
                    <FormattedMessage id="admin/egoi-admin.asButton" />
                  </Button>
                </span>
              </div>
            </div>
          ) : (
            <div>
              <p>
                <FormattedMessage id="admin/egoi-admin.configNeed" />
              </p>
            </div>
          )}
        </PageBlock>
      </Layout>
    </>
  )
}

export default AdvancedSettingsTab

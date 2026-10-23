'use client'
import React, { useState } from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from 'reactstrap';
import { RiAndroidLine, RiAppleLine } from 'react-icons/ri';
import { APP_URLS } from '@/utils/constants';

const HeaderGetApp = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen((prev) => !prev);

  const ANDROID_URL = APP_URLS.ANDROID;
  const IOS_URL = APP_URLS.IOS;

  if (!ANDROID_URL && !IOS_URL) return null;

  const redirectTo = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dropdown
      className="theme-form-select"
      isOpen={dropdownOpen}
      toggle={toggle}
      direction="down"
    >
      <DropdownToggle color='primary' caret className="select-dropdown" type="button">
        <span>Get the App</span>
      </DropdownToggle>

      <DropdownMenu
        container="body"
        strategy="fixed"
        end
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ]}
        className="sm-dropdown-menu get-app-dropdown-menu"
      >
        {ANDROID_URL && (
          <DropdownItem onClick={() => redirectTo(ANDROID_URL)} style={{ fontSize: 14 }}>
            <RiAndroidLine className="me-2" style={{ fontSize: 14 }} />
            Android App
          </DropdownItem>
        )}

        {/* {IOS_URL && (
          <DropdownItem onClick={() => redirectTo(IOS_URL)} style={{fontSize: 14}}>
            <RiAppleLine className="me-2" style={{fontSize: 14}} />
            iOS App
          </DropdownItem>
        )} */}
      </DropdownMenu>
    </Dropdown>
  );
};

export default HeaderGetApp;

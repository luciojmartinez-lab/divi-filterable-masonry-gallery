import React from 'react';
import { StyleContainer } from '@divi/module';

export const ModuleStyles = ({
	elements,
	settings,
	mode,
	state,
	noStyleTag
}) => (
	<StyleContainer mode={mode} state={state} noStyleTag={noStyleTag}>
		{elements.style({
			attrName: 'module',
			styleProps: {
				disabledOn: {
					disabledModuleVisibility: settings?.disabledModuleVisibility
				}
			}
		})}
	</StyleContainer>
);

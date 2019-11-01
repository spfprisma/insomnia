// @flow
import type { Settings } from '../../models/settings';
import type { Response } from '../../models/response';
import type { OAuth2Token } from '../../models/o-auth-2-token';
import type { Workspace } from '../../models/workspace';
import type {
  Request,
  RequestAuthentication,
  RequestBody,
  RequestHeader,
  RequestParameter,
} from '../../models/request';
import type { SidebarChildObjects } from './sidebar/sidebar-children';
import SidebarChildren from './sidebar/sidebar-children';

import * as React from 'react';
import autobind from 'autobind-decorator';
import classnames from 'classnames';
import { registerModal, showError, showModal, showAlert } from './modals/index';
import AlertModal from './modals/alert-modal';
import WrapperModal from './modals/wrapper-modal';
import ErrorModal from './modals/error-modal';
import CookiesModal from './modals/cookies-modal';
import CookieModifyModal from '../components/modals/cookie-modify-modal';
import EnvironmentEditModal from './modals/environment-edit-modal';
import GenerateCodeModal from './modals/generate-code-modal';
import LoginModal from './modals/login-modal';
import ResponseDebugModal from './modals/response-debug-modal';
import PaymentNotificationModal from './modals/payment-notification-modal';
import NunjucksModal from './modals/nunjucks-modal';
import PromptModal from './modals/prompt-modal';
import AskModal from './modals/ask-modal';
import SelectModal from './modals/select-modal';
import RequestCreateModal from './modals/request-create-modal';
import RequestPane from './request-pane';
import RequestSwitcherModal from './modals/request-switcher-modal';
import SettingsModal from './modals/settings-modal';
import FilterHelpModal from './modals/filter-help-modal';
import ResponsePane from './response-pane';
import RequestSettingsModal from './modals/request-settings-modal';
import SetupSyncModal from './modals/setup-sync-modal';
import SyncStagingModal from './modals/sync-staging-modal';
import GitRepositorySettingsModal from './modals/git-repository-settings-modal';
import GitStagingModal from './modals/git-staging-modal';
import GitBranchesModal from './modals/git-branches-modal';
import GitLogModal from './modals/git-log-modal';
import SyncMergeModal from './modals/sync-merge-modal';
import SyncHistoryModal from './modals/sync-history-modal';
import SyncShareModal from './modals/sync-share-modal';
import SyncBranchesModal from './modals/sync-branches-modal';
import RequestRenderErrorModal from './modals/request-render-error-modal';
import Sidebar from './sidebar/sidebar';
import WorkspaceEnvironmentsEditModal from './modals/workspace-environments-edit-modal';
import WorkspaceSettingsModal from './modals/workspace-settings-modal';
import WorkspaceShareSettingsModal from './modals/workspace-share-settings-modal';
import CodePromptModal from './modals/code-prompt-modal';
import * as db from '../../common/database';
import * as models from '../../models/index';
import * as importers from 'insomnia-importers';
import type { CookieJar } from '../../models/cookie-jar';
import type { Environment } from '../../models/environment';
import ErrorBoundary from './error-boundary';
import type { ClientCertificate } from '../../models/client-certificate';
import MoveRequestGroupModal from './modals/move-request-group-modal';
import AddKeyCombinationModal from './modals/add-key-combination-modal';
import ExportRequestsModal from './modals/export-requests-modal';
import VCS from '../../sync/vcs';
import type { StatusCandidate } from '../../sync/types';
import type { RequestMeta } from '../../models/request-meta';
import type { RequestVersion } from '../../models/request-version';
import type { GlobalActivity } from './activity-bar/activity-bar';
import ActivityBar from './activity-bar/activity-bar';
import SpecEditor from './spec-editor/spec-editor';
import SpecEditorSidebar from './spec-editor/spec-editor-sidebar';
import EnvironmentsDropdown from './dropdowns/environments-dropdown';
import SidebarFilter from './sidebar/sidebar-filter';
import type { ApiSpec } from '../../models/api-spec';
import GitVCS from '../../sync/git/git-vcs';
import Onboarding from './onboarding';
import YAML from 'yaml';
import { importRaw } from '../../common/import';
import { trackPageView } from '../../common/analytics';
import type { GitRepository } from '../../models/git-repository';

type Props = {
  // Helper Functions
  handleActivateRequest: Function,
  handleSetSidebarFilter: Function,
  handleToggleMenuBar: Function,
  handleImportFileToWorkspace: Function,
  handleImportUriToWorkspace: Function,
  handleInitializeEntities: Function,
  handleExportFile: Function,
  handleShowExportRequestsModal: Function,
  handleShowSettingsModal: Function,
  handleExportRequestsToFile: Function,
  handleSetActiveWorkspace: Function,
  handleSetActiveEnvironment: Function,
  handleMoveDoc: Function,
  handleCreateRequest: Function,
  handleDuplicateRequest: Function,
  handleDuplicateRequestGroup: Function,
  handleMoveRequestGroup: Function,
  handleDuplicateWorkspace: Function,
  handleCreateRequestGroup: Function,
  handleGenerateCodeForActiveRequest: Function,
  handleGenerateCode: Function,
  handleCopyAsCurl: Function,
  handleCreateRequestForWorkspace: Function,
  handleSetRequestPaneRef: Function,
  handleSetResponsePaneRef: Function,
  handleSetResponsePreviewMode: Function,
  handleRender: Function,
  handleGetRenderContext: Function,
  handleSetResponseFilter: Function,
  handleSetActiveResponse: Function,
  handleSetSidebarRef: Function,
  handleStartDragSidebar: Function,
  handleResetDragSidebar: Function,
  handleStartDragPaneHorizontal: Function,
  handleStartDragPaneVertical: Function,
  handleResetDragPaneHorizontal: Function,
  handleResetDragPaneVertical: Function,
  handleSetRequestGroupCollapsed: Function,
  handleSetRequestPinned: Function,
  handleSendRequestWithEnvironment: Function,
  handleSendAndDownloadRequestWithEnvironment: Function,
  handleSetActiveGitRepository: (string | null) => Promise<void>,
  handleUpdateRequestMimeType: Function,
  handleUpdateDownloadPath: Function,
  handleSetActiveActivity: (activity: string) => void,

  // Properties
  activity: GlobalActivity,
  loadStartTime: number,
  isLoading: boolean,
  paneWidth: number,
  paneHeight: number,
  responsePreviewMode: string,
  responseFilter: string,
  responseFilterHistory: Array<string>,
  responseDownloadPath: string | null,
  sidebarWidth: number,
  sidebarHidden: boolean,
  sidebarFilter: string,
  sidebarChildren: SidebarChildObjects,
  settings: Settings,
  workspaces: Array<Workspace>,
  requestMetas: Array<RequestMeta>,
  requests: Array<Request>,
  requestVersions: Array<RequestVersion>,
  unseenWorkspaces: Array<Workspace>,
  workspaceChildren: Array<Object>,
  environments: Array<Object>,
  activeApiSpec: ApiSpec,
  activeRequestResponses: Array<Response>,
  activeWorkspace: Workspace,
  activeCookieJar: CookieJar,
  activeEnvironment: Environment | null,
  activeGitRepository: GitRepository | null,
  activeWorkspaceClientCertificates: Array<ClientCertificate>,
  isVariableUncovered: boolean,
  headerEditorKey: string,
  vcs: VCS | null,
  gitVCS: GitVCS | null,
  gitRepositories: Array<GitRepository>,
  syncItems: Array<StatusCandidate>,

  // Optional
  oAuth2Token: OAuth2Token | null,
  activeRequest: Request | null,
  activeResponse: Response | null,
};

type State = {
  forceRefreshKey: number,
};

const rUpdate = (request, ...args) => {
  if (!request) {
    throw new Error('Tried to update null request');
  }

  return models.request.update(request, ...args);
};

const sUpdate = models.settings.update;

@autobind
class Wrapper extends React.PureComponent<Props, State> {
  specEditor: ?SpecEditor;

  constructor(props: any) {
    super(props);
    this.state = {
      forceRefreshKey: Date.now(),
    };
  }

  // Request updaters
  async _handleForceUpdateRequest(r: Request, patch: Object): Promise<Request> {
    const newRequest = await rUpdate(r, patch);

    // Give it a second for the app to render first. If we don't wait, it will refresh
    // on the old request and won't catch the newest one.
    // TODO: Move this refresh key into redux store so we don't need timeout
    window.setTimeout(this._forceRequestPaneRefresh, 100);

    return newRequest;
  }

  _handleForceUpdateRequestHeaders(r: Request, headers: Array<RequestHeader>): Promise<Request> {
    return this._handleForceUpdateRequest(r, { headers });
  }

  async _handleUpdateApiSpec(s: ApiSpec) {
    await models.apiSpec.update(s);
  }

  static _handleUpdateRequestBody(r: Request, body: RequestBody): Promise<Request> {
    return rUpdate(r, { body });
  }

  static _handleUpdateRequestParameters(
    r: Request,
    parameters: Array<RequestParameter>,
  ): Promise<Request> {
    return rUpdate(r, { parameters });
  }

  static _handleUpdateRequestAuthentication(
    r: Request,
    authentication: RequestAuthentication,
  ): Promise<Request> {
    return rUpdate(r, { authentication });
  }

  static _handleUpdateRequestHeaders(r: Request, headers: Array<RequestHeader>): Promise<Request> {
    return rUpdate(r, { headers });
  }

  static _handleUpdateRequestMethod(r: Request, method: string): Promise<Request> {
    return rUpdate(r, { method });
  }

  static _handleUpdateRequestUrl(r: Request, url: string): Promise<Request> {
    // Don't update if we don't need to
    if (r.url === url) {
      return Promise.resolve(r);
    }

    return rUpdate(r, { url });
  }

  // Special request updaters
  _handleStartDragSidebar(e: Event): void {
    e.preventDefault();
    this.props.handleStartDragSidebar();
  }

  async _handleImport(text: string): Promise<Request | null> {
    // Allow user to paste any import file into the url. If it results in
    // only one item, it will overwrite the current request.
    try {
      const { data } = await importers.convert(text);
      const { resources } = data;
      const r = resources[0];

      if (r && r._type === 'request' && this.props.activeRequest) {
        // Only pull fields that we want to update
        return this._handleForceUpdateRequest(this.props.activeRequest, {
          url: r.url,
          method: r.method,
          headers: r.headers,
          body: r.body,
          authentication: r.authentication,
          parameters: r.parameters,
        });
      }
    } catch (e) {
      // Import failed, that's alright
    }

    return null;
  }

  _handleDebugSpec() {
    showAlert({
      title: 'Debug Spec',
      okLabel: 'Generate Requests',
      message:
        'Debugging this spec will overwrite all requests in the test activity.' +
        ' Do you want to proceed?',
      onConfirm: async () => {
        const { activeWorkspace, activeApiSpec, handleSetActiveActivity } = this.props;
        await importRaw(
          () => Promise.resolve(activeWorkspace._id), // Always import into current workspace
          activeApiSpec.contents,
        );
        handleSetActiveActivity('debug');
      },
    });
  }

  _handleDeploySpec() {
    showAlert({
      title: 'Deploy to Kong',
      okLabel: 'Deploy Spec',
      message:
        'Deploying this spec to Kong is going to add all the services ' +
        'and routes to Kong. Do you want to proceed?',
      onConfirm: async () => {
        const { activeApiSpec, handleSetActiveActivity } = this.props;

        let spec;
        try {
          spec =
            activeApiSpec.type === 'json'
              ? JSON.parse(activeApiSpec.contents)
              : YAML.parse(activeApiSpec.contents);
        } catch (err) {
          console.log('[spec-sidebar] Failed to parse', err.message);
          return;
        }

        let resp;
        try {
          resp = await window.fetch('http://localhost:8001/default/oas-config/v2', {
            method: 'post',
            body: JSON.stringify(spec, null, 2),
            headers: {
              'Content-Type': 'application/json',
            },
          });
        } catch (err) {
          showError({
            title: 'Deploy Failed',
            error: err,
            message: 'Deploy to kong failed',
          });
          return;
        }

        if (!resp.ok) {
          showError({
            title: 'Deploy Failed',
            error: new Error('Status code ' + resp.status),
            message: 'Deploy to kong failed',
          });
          return;
        }

        console.log('Deployment', await resp.json());
        handleSetActiveActivity('monitor');
      },
    });
    // showModal(WrapperModal, {
    //   title: 'Deploy to Kong',
    //   body: (
    //     <React.Fragment>
    //       <p>
    //         Deploying this spec to Kong is going to add all the services
    //         and routes to Kong. Do you want to proceed?
    //       </p>
    //       <button className="btn btn--clicky">
    //         Deploy Spec
    //       </button>
    //     </React.Fragment>
    //   ),
    // });
  }

  // Settings updaters
  _handleUpdateSettingsShowPasswords(showPasswords: boolean): Promise<Settings> {
    return sUpdate(this.props.settings, { showPasswords });
  }

  _handleUpdateSettingsUseBulkHeaderEditor(useBulkHeaderEditor: boolean): Promise<Settings> {
    return sUpdate(this.props.settings, { useBulkHeaderEditor });
  }

  // Other Helpers
  _handleImportFile(forceToWorkspace?: boolean): void {
    this.props.handleImportFileToWorkspace(this.props.activeWorkspace._id, forceToWorkspace);
  }

  _handleImportUri(uri: string, forceToWorkspace?: boolean): void {
    this.props.handleImportUriToWorkspace(this.props.activeWorkspace._id, uri, forceToWorkspace);
  }

  _handleSetActiveResponse(responseId: string | null): void {
    if (!this.props.activeRequest) {
      console.warn('Tried to set active response when request not active');
      return;
    }

    this.props.handleSetActiveResponse(this.props.activeRequest._id, responseId);
  }

  _handleShowEnvironmentsModal(): void {
    showModal(WorkspaceEnvironmentsEditModal, this.props.activeWorkspace);
  }

  _handleShowCookiesModal(): void {
    showModal(CookiesModal, this.props.activeWorkspace);
  }

  static _handleShowModifyCookieModal(cookie: Object): void {
    showModal(CookieModifyModal, cookie);
  }

  _handleShowRequestSettingsModal(): void {
    showModal(RequestSettingsModal, { request: this.props.activeRequest });
  }

  async _handleDeleteResponses(): Promise<void> {
    if (!this.props.activeRequest) {
      console.warn('Tried to delete responses when request not active');
      return;
    }

    await models.response.removeForRequest(this.props.activeRequest._id);
    this._handleSetActiveResponse(null);
  }

  async _handleDeleteResponse(response: Response): Promise<void> {
    if (response) {
      await models.response.remove(response);
    }

    // Also unset active response it's the one we're deleting
    if (this.props.activeResponse && this.props.activeResponse._id === response._id) {
      this._handleSetActiveResponse(null);
    }
  }

  async _handleRemoveActiveWorkspace(): Promise<void> {
    const { workspaces, activeWorkspace } = this.props;
    if (workspaces.length <= 1) {
      showModal(AlertModal, {
        title: 'Deleting Last Workspace',
        message: 'Since you deleted your only workspace, a new one has been created for you.',
      });

      models.workspace.create({ name: 'Insomnia' });
    }

    await models.workspace.remove(activeWorkspace);
  }

  async _handleActiveWorkspaceClearAllResponses(): Promise<void> {
    const docs = await db.withDescendants(this.props.activeWorkspace, models.request.type);
    const requests = docs.filter(doc => doc.type === models.request.type);
    for (const req of requests) {
      await models.response.removeForRequest(req._id);
    }
  }

  _handleSendRequestWithActiveEnvironment(): void {
    const { activeRequest, activeEnvironment, handleSendRequestWithEnvironment } = this.props;
    const activeRequestId = activeRequest ? activeRequest._id : 'n/a';
    const activeEnvironmentId = activeEnvironment ? activeEnvironment._id : 'n/a';
    handleSendRequestWithEnvironment(activeRequestId, activeEnvironmentId);
  }

  async _handleSendAndDownloadRequestWithActiveEnvironment(filename?: string): Promise<void> {
    const {
      activeRequest,
      activeEnvironment,
      handleSendAndDownloadRequestWithEnvironment,
    } = this.props;

    const activeRequestId = activeRequest ? activeRequest._id : 'n/a';
    const activeEnvironmentId = activeEnvironment ? activeEnvironment._id : 'n/a';
    await handleSendAndDownloadRequestWithEnvironment(
      activeRequestId,
      activeEnvironmentId,
      filename,
    );
  }

  _handleSetPreviewMode(previewMode: string): void {
    const activeRequest = this.props.activeRequest;
    const activeRequestId = activeRequest ? activeRequest._id : 'n/a';
    this.props.handleSetResponsePreviewMode(activeRequestId, previewMode);
  }

  _handleSetResponseFilter(filter: string): void {
    const activeRequest = this.props.activeRequest;
    const activeRequestId = activeRequest ? activeRequest._id : 'n/a';
    this.props.handleSetResponseFilter(activeRequestId, filter);
  }

  _handleCreateRequestInWorkspace() {
    const { activeWorkspace, handleCreateRequest } = this.props;
    handleCreateRequest(activeWorkspace._id);
  }

  _handleCreateRequestGroupInWorkspace() {
    const { activeWorkspace, handleCreateRequestGroup } = this.props;
    handleCreateRequestGroup(activeWorkspace._id);
  }

  _handleChangeEnvironment(id: string) {
    const { handleSetActiveEnvironment } = this.props;
    handleSetActiveEnvironment(id);
  }

  _forceRequestPaneRefresh(): void {
    this.setState({ forceRefreshKey: Date.now() });
  }

  _setSpecEditorRef(n: ?SpecEditor) {
    this.specEditor = n;
  }

  _handleJumpToLine(val: string, value: string | Object) {
    if (this.specEditor) {
      this.specEditor.jumpToLine(val, value);
    }
  }

  renderSpecEditorSidebarBody(): React.Node {
    const { activeApiSpec } = this.props;
    return (
      <ErrorBoundary showAlert>
        <SpecEditorSidebar apiSpec={activeApiSpec} handleJumpToLine={this._handleJumpToLine} />
      </ErrorBoundary>
    );
  }

  componentDidMount() {
    const { activity } = this.props;
    trackPageView(`/${activity || ''}`);
  }

  componentDidUpdate(prevProps: Props) {
    // We're using activities as page views so here we monitor
    // for a change in activity and send it as a pageview.
    const { activity } = this.props;
    if (prevProps.activity !== activity) {
      trackPageView(`/${activity || ''}`);
    }
  }

  renderSidebarBody(): React.Node {
    if (this.props.activity === 'spec') {
      return this.renderSpecEditorSidebarBody();
    } else if (this.props.activity === 'debug') {
      const {
        activeEnvironment,
        activeRequest,
        activeWorkspace,
        environments,
        handleActivateRequest,
        handleCopyAsCurl,
        handleCreateRequest,
        handleCreateRequestGroup,
        handleDuplicateRequest,
        handleDuplicateRequestGroup,
        handleGenerateCode,
        handleMoveDoc,
        handleMoveRequestGroup,
        handleSetRequestGroupCollapsed,
        handleSetRequestPinned,
        handleSetSidebarFilter,
        settings,
        sidebarChildren,
        sidebarFilter,
        sidebarWidth,
        sidebarHidden,
      } = this.props;

      return (
        <React.Fragment>
          <div className="sidebar__menu">
            <EnvironmentsDropdown
              handleChangeEnvironment={this._handleChangeEnvironment}
              activeEnvironment={activeEnvironment}
              environments={environments}
              workspace={activeWorkspace}
              environmentHighlightColorStyle={settings.environmentHighlightColorStyle}
              hotKeyRegistry={settings.hotKeyRegistry}
            />
            <button className="btn btn--super-compact" onClick={this._handleShowCookiesModal}>
              <div className="sidebar__menu__thing">
                <span>Cookies</span>
              </div>
            </button>
          </div>

          <SidebarFilter
            key={`${activeWorkspace._id}::filter`}
            onChange={handleSetSidebarFilter}
            requestCreate={this._handleCreateRequestInWorkspace}
            requestGroupCreate={this._handleCreateRequestGroupInWorkspace}
            filter={sidebarFilter || ''}
            hotKeyRegistry={settings.hotKeyRegistry}
          />

          <SidebarChildren
            childObjects={sidebarChildren}
            handleActivateRequest={handleActivateRequest}
            handleCreateRequest={handleCreateRequest}
            handleCreateRequestGroup={handleCreateRequestGroup}
            handleSetRequestGroupCollapsed={handleSetRequestGroupCollapsed}
            handleSetRequestPinned={handleSetRequestPinned}
            handleDuplicateRequest={handleDuplicateRequest}
            handleDuplicateRequestGroup={handleDuplicateRequestGroup}
            handleMoveRequestGroup={handleMoveRequestGroup}
            handleGenerateCode={handleGenerateCode}
            handleCopyAsCurl={handleCopyAsCurl}
            moveDoc={handleMoveDoc}
            hidden={sidebarHidden}
            width={sidebarWidth}
            workspace={activeWorkspace}
            activeRequest={activeRequest}
            filter={sidebarFilter || ''}
            hotKeyRegistry={settings.hotKeyRegistry}
            activeEnvironment={activeEnvironment}
          />
        </React.Fragment>
      );
    } else {
      return null;
    }
  }

  render() {
    const {
      activity,
      activeApiSpec,
      activeCookieJar,
      activeEnvironment,
      activeGitRepository,
      activeRequest,
      activeRequestResponses,
      activeResponse,
      activeWorkspace,
      activeWorkspaceClientCertificates,
      handleActivateRequest,
      handleCreateRequestForWorkspace,
      handleDuplicateWorkspace,
      handleExportFile,
      handleExportRequestsToFile,
      handleGenerateCodeForActiveRequest,
      handleGetRenderContext,
      handleInitializeEntities,
      handleRender,
      handleResetDragPaneHorizontal,
      handleResetDragPaneVertical,
      handleResetDragSidebar,
      handleSetActiveActivity,
      handleSetActiveEnvironment,
      handleSetActiveGitRepository,
      handleSetActiveWorkspace,
      handleSetRequestPaneRef,
      handleSetResponsePaneRef,
      handleSetSidebarRef,
      handleShowExportRequestsModal,
      handleShowSettingsModal,
      handleStartDragPaneHorizontal,
      handleStartDragPaneVertical,
      handleToggleMenuBar,
      handleUpdateDownloadPath,
      handleUpdateRequestMimeType,
      headerEditorKey,
      isLoading,
      isVariableUncovered,
      loadStartTime,
      oAuth2Token,
      paneHeight,
      paneWidth,
      requestMetas,
      requestVersions,
      responseDownloadPath,
      responseFilter,
      responseFilterHistory,
      responsePreviewMode,
      settings,
      sidebarChildren,
      sidebarHidden,
      sidebarWidth,
      syncItems,
      unseenWorkspaces,
      vcs,
      gitVCS,
      workspaceChildren,
      workspaces,
    } = this.props;

    const realSidebarWidth = sidebarHidden ? 0 : sidebarWidth;

    const columns = `auto ${realSidebarWidth}rem 0 minmax(0, ${paneWidth}fr) 0 minmax(0, ${1 -
      paneWidth}fr)`;
    const rows = `minmax(0, ${paneHeight}fr) 0 minmax(0, ${1 - paneHeight}fr)`;

    const sidebarBody = this.renderSidebarBody();

    return (
      <React.Fragment>
        <div key="modals" className="modals">
          <ErrorBoundary showAlert>
            <AlertModal ref={registerModal} />
            <ErrorModal ref={registerModal} />
            <PromptModal ref={registerModal} />

            <WrapperModal ref={registerModal} />
            <LoginModal ref={registerModal} />
            <AskModal ref={registerModal} />
            <SelectModal ref={registerModal} />
            <RequestCreateModal ref={registerModal} />
            <PaymentNotificationModal ref={registerModal} />
            <FilterHelpModal ref={registerModal} />
            <RequestRenderErrorModal ref={registerModal} />

            <CodePromptModal
              ref={registerModal}
              handleRender={handleRender}
              handleGetRenderContext={handleGetRenderContext}
              nunjucksPowerUserMode={settings.nunjucksPowerUserMode}
              editorFontSize={settings.editorFontSize}
              editorIndentSize={settings.editorIndentSize}
              editorKeyMap={settings.editorKeyMap}
              editorLineWrapping={settings.editorLineWrapping}
              isVariableUncovered={isVariableUncovered}
            />

            <RequestSettingsModal
              ref={registerModal}
              editorFontSize={settings.editorFontSize}
              editorIndentSize={settings.editorIndentSize}
              editorKeyMap={settings.editorKeyMap}
              editorLineWrapping={settings.editorLineWrapping}
              handleRender={handleRender}
              handleGetRenderContext={handleGetRenderContext}
              nunjucksPowerUserMode={settings.nunjucksPowerUserMode}
              workspaces={workspaces}
              isVariableUncovered={isVariableUncovered}
            />

            {/* TODO: Figure out why cookieJar is sometimes null */}
            {activeCookieJar ? (
              <CookiesModal
                handleShowModifyCookieModal={Wrapper._handleShowModifyCookieModal}
                handleRender={handleRender}
                nunjucksPowerUserMode={settings.nunjucksPowerUserMode}
                ref={registerModal}
                workspace={activeWorkspace}
                cookieJar={activeCookieJar}
                isVariableUncovered={isVariableUncovered}
              />
            ) : null}

            <CookieModifyModal
              handleRender={handleRender}
              handleGetRenderContext={handleGetRenderContext}
              nunjucksPowerUserMode={settings.nunjucksPowerUserMode}
              ref={registerModal}
              cookieJar={activeCookieJar}
              workspace={activeWorkspace}
              isVariableUncovered={isVariableUncovered}
            />

            <NunjucksModal
              uniqueKey={`key::${this.state.forceRefreshKey}`}
              ref={registerModal}
              handleRender={handleRender}
              handleGetRenderContext={handleGetRenderContext}
              workspace={activeWorkspace}
            />

            <MoveRequestGroupModal ref={registerModal} workspaces={workspaces} />

            <WorkspaceSettingsModal
              ref={registerModal}
              clientCertificates={activeWorkspaceClientCertificates}
              workspace={activeWorkspace}
              editorFontSize={settings.editorFontSize}
              editorIndentSize={settings.editorIndentSize}
              editorKeyMap={settings.editorKeyMap}
              editorLineWrapping={settings.editorLineWrapping}
              handleRender={handleRender}
              handleGetRenderContext={handleGetRenderContext}
              nunjucksPowerUserMode={settings.nunjucksPowerUserMode}
              handleRemoveWorkspace={this._handleRemoveActiveWorkspace}
              handleDuplicateWorkspace={handleDuplicateWorkspace}
              handleClearAllResponses={this._handleActiveWorkspaceClearAllResponses}
              isVariableUncovered={isVariableUncovered}
            />

            <WorkspaceShareSettingsModal ref={registerModal} workspace={activeWorkspace} />

            <GenerateCodeModal
              ref={registerModal}
              environmentId={activeEnvironment ? activeEnvironment._id : 'n/a'}
              editorFontSize={settings.editorFontSize}
              editorIndentSize={settings.editorIndentSize}
              editorKeyMap={settings.editorKeyMap}
            />

            <SettingsModal
              ref={registerModal}
              handleShowExportRequestsModal={handleShowExportRequestsModal}
              handleExportAllToFile={handleExportFile}
              handleImportFile={this._handleImportFile}
              handleImportUri={this._handleImportUri}
              handleToggleMenuBar={handleToggleMenuBar}
              settings={settings}
            />

            <ResponseDebugModal ref={registerModal} settings={settings} />

            <RequestSwitcherModal
              ref={registerModal}
              workspace={activeWorkspace}
              workspaces={workspaces}
              workspaceChildren={workspaceChildren}
              activeRequest={activeRequest}
              activateRequest={handleActivateRequest}
              requestMetas={requestMetas}
              handleSetActiveWorkspace={handleSetActiveWorkspace}
            />

            <EnvironmentEditModal
              ref={registerModal}
              editorFontSize={settings.editorFontSize}
              editorIndentSize={settings.editorIndentSize}
              editorKeyMap={settings.editorKeyMap}
              lineWrapping={settings.editorLineWrapping}
              onChange={models.requestGroup.update}
              render={handleRender}
              getRenderContext={handleGetRenderContext}
              nunjucksPowerUserMode={settings.nunjucksPowerUserMode}
              isVariableUncovered={isVariableUncovered}
            />

            <SetupSyncModal ref={registerModal} workspace={activeWorkspace} />

            {gitVCS && (
              <React.Fragment>
                <GitStagingModal ref={registerModal} workspace={activeWorkspace} vcs={gitVCS} />
                <GitLogModal ref={registerModal} vcs={gitVCS} />
                <GitRepositorySettingsModal
                  ref={registerModal}
                  handleSetActiveGitRepository={handleSetActiveGitRepository}
                />
                {activeGitRepository !== null && (
                  <GitBranchesModal
                    ref={registerModal}
                    vcs={gitVCS}
                    gitRepository={activeGitRepository}
                    handleInitializeEntities={handleInitializeEntities}
                  />
                )}
              </React.Fragment>
            )}

            {vcs && (
              <React.Fragment>
                <SyncStagingModal
                  ref={registerModal}
                  workspace={activeWorkspace}
                  vcs={vcs}
                  syncItems={syncItems}
                />
                <SyncMergeModal
                  ref={registerModal}
                  workspace={activeWorkspace}
                  syncItems={syncItems}
                  vcs={vcs}
                />
                <SyncBranchesModal
                  ref={registerModal}
                  workspace={activeWorkspace}
                  vcs={vcs}
                  syncItems={syncItems}
                />
                <SyncHistoryModal ref={registerModal} workspace={activeWorkspace} vcs={vcs} />
                <SyncShareModal ref={registerModal} workspace={activeWorkspace} vcs={vcs} />
              </React.Fragment>
            )}

            <WorkspaceEnvironmentsEditModal
              ref={registerModal}
              onChange={models.workspace.update}
              lineWrapping={settings.editorLineWrapping}
              editorFontSize={settings.editorFontSize}
              editorIndentSize={settings.editorIndentSize}
              editorKeyMap={settings.editorKeyMap}
              activeEnvironmentId={activeEnvironment ? activeEnvironment._id : null}
              render={handleRender}
              getRenderContext={handleGetRenderContext}
              nunjucksPowerUserMode={settings.nunjucksPowerUserMode}
              isVariableUncovered={isVariableUncovered}
            />

            <AddKeyCombinationModal ref={registerModal} />
            <ExportRequestsModal
              ref={registerModal}
              childObjects={sidebarChildren.all}
              handleExportRequestsToFile={handleExportRequestsToFile}
            />
          </ErrorBoundary>
        </div>
        <div
          key="wrapper"
          id="wrapper"
          className={classnames('wrapper', {
            'wrapper--vertical': settings.forceVerticalLayout,
          })}
          style={{
            gridTemplateColumns: columns,
            gridTemplateRows: rows,
            boxSizing: 'border-box',
            borderTop:
              activeEnvironment &&
              activeEnvironment.color &&
              settings.environmentHighlightColorStyle === 'window-top'
                ? '5px solid ' + activeEnvironment.color
                : null,
            borderBottom:
              activeEnvironment &&
              activeEnvironment.color &&
              settings.environmentHighlightColorStyle === 'window-bottom'
                ? '5px solid ' + activeEnvironment.color
                : null,
            borderLeft:
              activeEnvironment &&
              activeEnvironment.color &&
              settings.environmentHighlightColorStyle === 'window-left'
                ? '5px solid ' + activeEnvironment.color
                : null,
            borderRight:
              activeEnvironment &&
              activeEnvironment.color &&
              settings.environmentHighlightColorStyle === 'window-right'
                ? '5px solid ' + activeEnvironment.color
                : null,
          }}>
          {activity && (
            <ActivityBar
              showSettings={handleShowSettingsModal}
              activity={activity}
              setActivity={handleSetActiveActivity}
              hotKeyRegistry={settings.hotKeyRegistry}
            />
          )}

          {sidebarBody && (
            <ErrorBoundary showAlert>
              <Sidebar
                ref={handleSetSidebarRef}
                activeEnvironment={activeEnvironment}
                activeGitRepository={activeGitRepository}
                enableSyncBeta={settings.enableSyncBeta}
                environmentHighlightColorStyle={settings.environmentHighlightColorStyle}
                handleInitializeEntities={handleInitializeEntities}
                handleSetActiveEnvironment={handleSetActiveEnvironment}
                handleSetActiveWorkspace={handleSetActiveWorkspace}
                handleDeploySpec={this._handleDeploySpec}
                hidden={sidebarHidden || false}
                hotKeyRegistry={settings.hotKeyRegistry}
                isLoading={isLoading}
                showEnvironmentsModal={this._handleShowEnvironmentsModal}
                syncItems={syncItems}
                unseenWorkspaces={unseenWorkspaces}
                vcs={vcs}
                gitVCS={gitVCS}
                width={sidebarWidth}
                workspace={activeWorkspace}
                workspaces={workspaces}>
                {sidebarBody}
              </Sidebar>

              <div className="drag drag--sidebar">
                <div
                  onDoubleClick={handleResetDragSidebar}
                  onMouseDown={this._handleStartDragSidebar}
                />
              </div>
            </ErrorBoundary>
          )}

          {activity === 'debug' && (
            <React.Fragment>
              <ErrorBoundary showAlert>
                <RequestPane
                  ref={handleSetRequestPaneRef}
                  handleImportFile={this._handleImportFile}
                  request={activeRequest}
                  workspace={activeWorkspace}
                  downloadPath={responseDownloadPath}
                  settings={settings}
                  environmentId={activeEnvironment ? activeEnvironment._id : ''}
                  oAuth2Token={oAuth2Token}
                  forceUpdateRequest={this._handleForceUpdateRequest}
                  handleCreateRequest={handleCreateRequestForWorkspace}
                  handleGenerateCode={handleGenerateCodeForActiveRequest}
                  handleImport={this._handleImport}
                  handleRender={handleRender}
                  handleGetRenderContext={handleGetRenderContext}
                  handleUpdateDownloadPath={handleUpdateDownloadPath}
                  updateRequestBody={Wrapper._handleUpdateRequestBody}
                  forceUpdateRequestHeaders={this._handleForceUpdateRequestHeaders}
                  updateRequestUrl={Wrapper._handleUpdateRequestUrl}
                  updateRequestMethod={Wrapper._handleUpdateRequestMethod}
                  updateRequestParameters={Wrapper._handleUpdateRequestParameters}
                  updateRequestAuthentication={Wrapper._handleUpdateRequestAuthentication}
                  updateRequestHeaders={Wrapper._handleUpdateRequestHeaders}
                  updateRequestMimeType={handleUpdateRequestMimeType}
                  updateSettingsShowPasswords={this._handleUpdateSettingsShowPasswords}
                  updateSettingsUseBulkHeaderEditor={this._handleUpdateSettingsUseBulkHeaderEditor}
                  forceRefreshCounter={this.state.forceRefreshKey}
                  handleSend={this._handleSendRequestWithActiveEnvironment}
                  handleSendAndDownload={this._handleSendAndDownloadRequestWithActiveEnvironment}
                  nunjucksPowerUserMode={settings.nunjucksPowerUserMode}
                  isVariableUncovered={isVariableUncovered}
                  headerEditorKey={headerEditorKey}
                />
              </ErrorBoundary>

              <div className="drag drag--pane-horizontal">
                <div
                  onMouseDown={handleStartDragPaneHorizontal}
                  onDoubleClick={handleResetDragPaneHorizontal}
                />
              </div>

              <div className="drag drag--pane-vertical">
                <div
                  onMouseDown={handleStartDragPaneVertical}
                  onDoubleClick={handleResetDragPaneVertical}
                />
              </div>

              <ErrorBoundary showAlert>
                <ResponsePane
                  ref={handleSetResponsePaneRef}
                  request={activeRequest}
                  requestVersions={requestVersions}
                  responses={activeRequestResponses}
                  response={activeResponse}
                  editorFontSize={settings.editorFontSize}
                  editorIndentSize={settings.editorIndentSize}
                  editorKeyMap={settings.editorKeyMap}
                  editorLineWrapping={settings.editorLineWrapping}
                  hotKeyRegistry={settings.hotKeyRegistry}
                  previewMode={responsePreviewMode}
                  filter={responseFilter}
                  filterHistory={responseFilterHistory}
                  loadStartTime={loadStartTime}
                  showCookiesModal={this._handleShowCookiesModal}
                  handleShowRequestSettings={this._handleShowRequestSettingsModal}
                  handleSetActiveResponse={this._handleSetActiveResponse}
                  handleSetPreviewMode={this._handleSetPreviewMode}
                  handleDeleteResponses={this._handleDeleteResponses}
                  handleDeleteResponse={this._handleDeleteResponse}
                  handleSetFilter={this._handleSetResponseFilter}
                />
              </ErrorBoundary>
            </React.Fragment>
          )}

          {activity === 'spec' && (
            <ErrorBoundary showAlert>
              <SpecEditor
                key={this.state.forceRefreshKey}
                ref={this._setSpecEditorRef}
                workspace={activeWorkspace}
                apiSpec={activeApiSpec}
                editorFontSize={settings.editorFontSize}
                editorIndentSize={settings.editorIndentSize}
                editorKeyMap={settings.editorKeyMap}
                lineWrapping={settings.editorLineWrapping}
                onChange={this._handleUpdateApiSpec}
                handleDeploy={this._handleDeploySpec}
                handleTest={this._handleDebugSpec}
              />
            </ErrorBoundary>
          )}

          {activity === 'monitor' && (
            <webview
              src={settings.kongManagerUrl}
              className="monitor-webview"
              nodeintegration="false"
            />
          )}
        </div>

        {activity === null && (
          <Onboarding
            settings={settings}
            handleImportFile={this._handleImportFile}
            handleImportUri={this._handleImportUri}
            handleSetActivity={handleSetActiveActivity}
          />
        )}
      </React.Fragment>
    );
  }
}

export default Wrapper;

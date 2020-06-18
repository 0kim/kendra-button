import * as Yup from 'yup';

import { MouseEvent, ReactElement } from 'react';
import { useMainContextImpls, useModalContextImpls } from '../contexts';

import { GraphQLResult } from '@aws-amplify/api-graphql';
import { Site } from '../types';
import { callGraphql } from '../utils';
import { createSite } from '../graphql/queries';
import { useFormik } from 'formik';

interface ResCreateSite {
  createSite: {
    site: Site;
  };
}
const SiteCreateModal = (): ReactElement => {
  const { modalConfig, setModalConfig } = useModalContextImpls();
  const { dispatch } = useMainContextImpls();

  const formik = useFormik({
    initialValues: {
      title: '',
      url: '',
      term: 'd',
    },
    validationSchema: Yup.object({
      title: Yup.string().required(`"Title"은 필수 입력 항목입니다.`),
      url: Yup.string()
        .url(`올바르지 않은 "url"입니다.`)
        .required(`"url"은 필수 입력 항목입니다.`),
      term: Yup.string().required(`"team"은 필수 입력 항목입니다.`),
    }),
    onSubmit: () => {},
  });
  const {
    type,
    display,
    blockExitOutside,
    positionTop,
    title,
    state,
    contentDisplay = ['header', 'body'],
    okaction,
    hideCloseBtn,
  } = modalConfig;
  const isMe = (type === 'site-create' || !type) && display;
  if (!isMe) {
    return null;
  }

  const hideModal = (): void => {
    setModalConfig((state) => ({
      ...modalConfig,
      display: false,
    }));
  };

  const onSubmit = async (): Promise<void> => {
    formik.submitForm();
    if (!formik.isValid) {
      return;
    }

    const res: GraphQLResult<ResCreateSite> = await callGraphql({
      query: createSite,
      variables: {
        site: formik.values.title,
        title: formik.values.title,
        url: formik.values.url,
        term: formik.values.term,
      },
    });

    console.log({ res });
    dispatch({
      type: 'reload-site',
      payload: {
        reloadSite: true,
      },
    });

    if (okaction) {
      okaction(state);
    }
    hideModal();
  };

  // example: { header: 'header', body: 'body', footer: 'footer' }
  const displayContent = contentDisplay.reduce((prev, curr) => {
    prev[curr] = true;
    return prev;
  }, {});
  return (
    <div
      className={isMe ? 'modal overflow-auto visible' : 'modal invisible'}
      id="plain-outer"
      onClick={(e: MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        target.id === 'plain-outer' && !blockExitOutside && hideModal();
      }}
    >
      <div
        className="modal-dialog"
        role="document"
        style={{ top: positionTop || '20%' }}
      >
        <div className="modal-content">
          {displayContent.header && (
            <div className="modal-header">
              <h5 className="modal-title">{modalConfig ? title : ''}</h5>
              {!hideCloseBtn && (
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={hideModal}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              )}
            </div>
          )}
          {displayContent.body && (
            <div className="modal-body">
              <div className="form-group">
                <label
                  className="form-control-label font-weight-bold"
                  htmlFor="input-title"
                >{`Title`}</label>
                <input
                  type="text"
                  className={`form-control ${
                    formik.touched.title && formik.errors.title
                      ? 'is-invalid'
                      : ''
                  }`}
                  id="input-title"
                  name="title"
                  placeholder={`input title`}
                  value={formik.values.title}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                />
                {formik.touched.title && formik.errors.title && (
                  <div className="invalid-feedback">{formik.errors.title}</div>
                )}
              </div>
              <div className="form-group">
                <label
                  className="form-control-label font-weight-bold"
                  htmlFor="input-url"
                >{`Url to crawl`}</label>
                <input
                  type="text"
                  className={`form-control ${
                    formik.touched.url && formik.errors.url ? 'is-invalid' : ''
                  }`}
                  id="input-url"
                  name="url"
                  placeholder={`input url`}
                  value={formik.values.url}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                />
                {formik.touched.url && formik.errors.url && (
                  <div className="invalid-feedback">{formik.errors.url}</div>
                )}
              </div>
              <div className="form-group">
                <label
                  className="form-control-label font-weight-bold"
                  htmlFor="select-term"
                >{`Crawl/index term`}</label>
                <select
                  className="custom-select"
                  id="select-term"
                  name="term"
                  defaultValue={formik.values.term}
                  onChange={formik.handleChange}
                >
                  <option value={`d`}>{`Daily`}</option>
                  <option value={`h`}>{`Hourly`}</option>
                </select>
              </div>
              <div className={`d-flex justify-content-end`}>
                <button
                  className={`btn btn-primary shadow-sm`}
                  onClick={onSubmit}
                >{`Create Site`}</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        #plain-outer {
          background-color: rgba(0, 0, 0, 0.5);
          transition: visibility 0s, opacity 0.15s linear;
          display: block;
          opacity: ${isMe ? 1 : 0};
        }
      `}</style>
    </div>
  );
};

export { SiteCreateModal };

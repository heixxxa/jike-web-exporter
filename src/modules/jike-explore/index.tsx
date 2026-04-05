import { BaseTableView } from '@/components/table/base';
import { columns } from '@/components/table/columns-jike-post';
import { ExtensionPanel, Modal } from '@/components/common';
import { useCaptureCount, useCapturedRecords, useClearCaptures } from '@/core/database/hooks';
import { Extension, ExtensionType } from '@/core/extensions';
import { TranslationKey, useTranslation } from '@/i18n';
import { JikePost } from '@/types/jike';
import { useToggle } from '@/utils/common';
import { JikeExploreInterceptor } from './api';

export default class JikeExploreModule extends Extension {
  name = 'jike-explore';
  type = ExtensionType.JIKE_POST;
  intercept = () => JikeExploreInterceptor;

  render = () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    return function () {
      const { t } = useTranslation();
      const [showModal, toggleShowModal] = useToggle();

      const count = useCaptureCount(self.name);
      const records = useCapturedRecords(self.name, self.type);
      const clearCapturedData = useClearCaptures(self.name);

      const title = t(self.name as TranslationKey);

      return (
        <ExtensionPanel
          title={title}
          description={`${t('Captured:')} ${count}`}
          active={!!count && (count as number) > 0}
          onClick={toggleShowModal}
          indicatorColor="bg-secondary"
        >
          <Modal
            class="max-w-5xl md:max-w-screen-lg sm:max-w-screen-sm min-h-[512px]"
            title={title}
            show={showModal}
            onClose={toggleShowModal}
          >
            <BaseTableView
              title={title}
              records={(records as JikePost[]) ?? []}
              columns={columns}
              clear={clearCapturedData}
            />
          </Modal>
        </ExtensionPanel>
      );
    };
  };
}

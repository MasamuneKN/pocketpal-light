import React, {useState, useEffect, useRef, useContext} from 'react';
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  type TextInputInstance,
  Alert,
} from 'react-native';

import {debounce} from 'lodash';
import {observer} from 'mobx-react-lite';
import {toJS} from 'mobx';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useIsFocused} from '@react-navigation/native';
import {
  Switch,
  Text,
  Card,
  Button,
  Icon,
  List,
  SegmentedButtons,
} from 'react-native-paper';

import {MoonIcon, ShareIcon} from '../../assets/icons';

import {TextInput} from '../../components/TextInput';
import {Menu} from '../../components/Menu';
import {Divider} from '../../components/Divider';
import {HFTokenSheet} from '../../components/HFTokenSheet';
import {InputSlider} from '../../components/InputSlider';

import {useTheme} from '../../hooks/useTheme';

import {createStyles} from './styles';
import {CacheTypeMenuRow} from './CacheTypeMenuRow';
import {useMenuAnchor} from './useMenuAnchor';

import {hfStore, modelStore, uiStore} from '../../store';

import {CacheType, ModelType} from '../../utils/types';
import {L10nContext} from '../../utils';
import {t} from '../../locales';
import {exportLegacyChatSessions} from '../../utils/exportUtils';
import {getDeviceOptions, DeviceOption} from '../../utils/deviceSelection';
import {
  inferBackendType,
  getAllowedCacheTypeKOptions,
  getAllowedCacheTypeVOptions,
} from '../../utils/flashAttnCompatibility';

export const SettingsScreen: React.FC = observer(() => {
  const l10n = useContext(L10nContext);
  const theme = useTheme();
  const styles = createStyles(theme);
  const isFocused = useIsFocused();
  const [contextSize, setContextSize] = useState(
    modelStore.contextInitParams.n_ctx.toString(),
  );
  const [isValidInput, setIsValidInput] = useState(true);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const inputRef = useRef<TextInputInstance>(null);
  const keyCacheMenu = useMenuAnchor();
  const valueCacheMenu = useMenuAnchor();
  const draftKeyCacheMenu = useMenuAnchor();
  const draftValueCacheMenu = useMenuAnchor();
  const draftModelMenu = useMenuAnchor();
  const [showHfTokenDialog, setShowHfTokenDialog] = useState(false);
  const [deviceOptions, setDeviceOptions] = useState<DeviceOption[]>([]);
  const [currentBackend, setCurrentBackend] = useState<
    'opencl' | 'hexagon' | 'cpu' | 'blas'
  >('cpu');
  const debouncedUpdateStore = useRef(
    debounce((value: number) => {
      modelStore.setNContext(value);
    }, 500),
  ).current;

  useEffect(() => {
    setContextSize(modelStore.contextInitParams.n_ctx.toString());

    const loadDeviceOptions = async () => {
      try {
        const options = await getDeviceOptions();
        setDeviceOptions(options);
      } catch (error) {
        console.warn('Failed to load device options:', error);
      }
    };

    loadDeviceOptions();
  }, []);

  // Skipped while the input is focused so the re-sync never fights typing.
  const configuredNCtx = modelStore.contextInitParams.n_ctx;
  useEffect(() => {
    if (isFocused && !inputRef.current?.isFocused()) {
      setContextSize(configuredNCtx.toString());
      setIsValidInput(true);
    }
  }, [isFocused, configuredNCtx]);

  // Convert MobX observable to plain JS for dependency tracking
  const devicesKey = JSON.stringify(toJS(modelStore.contextInitParams.devices));

  useEffect(() => {
    const updateBackend = async () => {
      const backend = await inferBackendType(
        modelStore.contextInitParams.devices,
      );
      setCurrentBackend(backend);
    };

    updateBackend();
  }, [devicesKey]);

  useEffect(() => {
    return () => {
      debouncedUpdateStore.cancel();
    };
  }, [debouncedUpdateStore]);

  const handleOutsidePress = () => {
    Keyboard.dismiss();
    inputRef.current?.blur();
    setContextSize(modelStore.contextInitParams.n_ctx.toString());
    setIsValidInput(true);
    keyCacheMenu.close();
    valueCacheMenu.close();
    draftKeyCacheMenu.close();
    draftValueCacheMenu.close();
    draftModelMenu.close();
  };

  const handleContextSizeChange = (text: string) => {
    setContextSize(text);
    const value = parseInt(text, 10);
    if (!isNaN(value) && value >= modelStore.MIN_CONTEXT_SIZE) {
      setIsValidInput(true);
      debouncedUpdateStore(value);
    } else {
      setIsValidInput(false);
    }
  };

  const currentFlashAttnType =
    modelStore.contextInitParams.flash_attn_type ?? 'off';
  const flashAttnOff =
    !modelStore.contextInitParams.flash_attn_type ||
    modelStore.contextInitParams.flash_attn_type === 'off';

  const cacheTypeKOptions = getAllowedCacheTypeKOptions(
    currentFlashAttnType as 'auto' | 'on' | 'off',
    currentBackend,
  );

  const cacheTypeVOptions = getAllowedCacheTypeVOptions(
    currentFlashAttnType as 'auto' | 'on' | 'off',
    currentBackend,
  );

  const getCacheTypeLabel = (
    value: CacheType | string,
    isValueCache = false,
  ) => {
    const options = isValueCache ? cacheTypeVOptions : cacheTypeKOptions;
    return options.find(option => option.value === value)?.label || value;
  };

  const speculativeEnabled =
    modelStore.contextInitParams.speculativeEnabled ?? false;
  const selectedDraftModelId =
    modelStore.contextInitParams.selectedDraftModelId;

  const activeModelId = modelStore.activeModel?.id;
  const eligibleDraftModels = modelStore.availableModels.filter(
    m =>
      m.isDownloaded &&
      m.modelType !== ModelType.PROJECTION &&
      m.id !== activeModelId,
  );
  const selectedDraftModel = eligibleDraftModels.find(
    m => m.id === selectedDraftModelId,
  );

  const draftMode = modelStore.effectiveDraftMode;
  const showSpeculativeNoEffectNote =
    speculativeEnabled && !!modelStore.activeModel && draftMode === 'off';

  const draftPickIgnoredNote = (() => {
    if (!selectedDraftModel) {
      return undefined;
    }
    const activeDefaultDraft = modelStore.activeModel?.defaultDraftModel;
    if (activeDefaultDraft && activeDefaultDraft !== selectedDraftModel.id) {
      return l10n.settings.speculativeDraftModelIgnoredOverridden;
    }
    if (draftMode === 'paired' || showSpeculativeNoEffectNote) {
      return undefined;
    }
    return modelStore.activeModel
      ? l10n.settings.speculativeDraftModelIgnoredIncompatible
      : l10n.settings.speculativeDraftModelIgnoredNotCapable;
  })();

  // Draft cache compatibility is the draft's own, not the target's flash-attn.
  const draftCacheTypeKOptions = getAllowedCacheTypeKOptions(
    'on',
    currentBackend,
  );
  const draftCacheTypeVOptions = getAllowedCacheTypeVOptions(
    'on',
    currentBackend,
  );
  const getDraftCacheTypeLabel = (
    value: CacheType | string | undefined,
    isValueCache = false,
  ) => {
    const defaults = modelStore.effectiveDraftCacheDefaults;
    const effectiveValue = value ?? (isValueCache ? defaults.v : defaults.k);
    const options = isValueCache
      ? draftCacheTypeVOptions
      : draftCacheTypeKOptions;
    return (
      options.find(option => option.value === effectiveValue)?.label ||
      effectiveValue
    );
  };

  const getCurrentDeviceId = (): string => {
    const devices = modelStore.contextInitParams.devices;

    // Android
    // No auto mode on Android - always explicit device selection
    if (!devices || devices.length === 0 || devices[0] === 'CPU') {
      return 'cpu';
    }

    if (devices[0].startsWith('HTP')) {
      return 'hexagon';
    }

    // GPU device (Adreno, etc.)
    return 'gpu';
  };

  const handleDeviceSelect = (option: DeviceOption) => {
    modelStore.setDevices(option.devices);

    // Only update flash attention if current value is not valid for the selected device
    const currentFlashAttn =
      modelStore.contextInitParams.flash_attn_type ?? 'off';

    if (!option.valid_flash_attn_types.includes(currentFlashAttn)) {
      // Current setting is invalid for this device, use the default
      modelStore.setFlashAttnType(option.default_flash_attn_type);
    }
    // Otherwise, keep the user's current flash attention preference
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <TouchableWithoutFeedback onPress={handleOutsidePress} accessible={false}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled">
          {/* Model Initialization Settings */}
          <Card elevation={0} style={styles.card}>
            <Card.Title title={l10n.settings.modelInitializationSettings} />
            <Card.Content>
              {/* Device Selection */}

              <View style={styles.settingItemContainer}>
                {/* Show full UI when multiple device options available */}
                {deviceOptions.length > 1 ? (
                  <>
                    <Text variant="titleMedium" style={styles.textLabel}>
                      {l10n.settings.deviceSelection}
                    </Text>
                    <Text variant="labelSmall" style={styles.textDescription}>
                      {l10n.settings.deviceSelectionAndroidDescription}
                    </Text>
                    <SegmentedButtons
                      value={getCurrentDeviceId()}
                      onValueChange={deviceId => {
                        const option = deviceOptions.find(
                          opt => opt.id === deviceId,
                        );
                        if (option) {
                          handleDeviceSelect(option);
                        }
                      }}
                      density="medium"
                      buttons={deviceOptions.map(option => ({
                        value: option.id,
                        label: option.label,
                        labelStyle: {
                          fontSize: 10,
                        },
                        testID: `device-option-${option.id}`,
                      }))}
                      style={styles.segmentedButtons}
                    />

                    {/* GPU Layers Slider */}
                    <InputSlider
                      testID="gpu-layers-slider"
                      value={modelStore.contextInitParams.n_gpu_layers}
                      onValueChange={value =>
                        modelStore.setNGPULayers(Math.round(value))
                      }
                      min={0}
                      max={99}
                      step={1}
                    />
                    <Text variant="labelSmall" style={styles.textDescription}>
                      {t(l10n.settings.layersOnGPU, {
                        gpuLayers:
                          modelStore.contextInitParams.n_gpu_layers.toString(),
                      })}
                    </Text>
                  </>
                ) : (
                  /* Simplified UI when only CPU available */
                  <>
                    <Text variant="titleMedium" style={styles.textLabel}>
                      {l10n.settings.deviceSelection}
                    </Text>
                    <Text variant="labelSmall" style={styles.textDescription}>
                      {l10n.settings.cpuOnlyNoAccelerators}
                    </Text>
                  </>
                )}
              </View>

              <Divider />

              {/* Context Size */}
              <View style={styles.settingItemContainer}>
                <Text variant="titleMedium" style={styles.textLabel}>
                  {l10n.settings.contextSize}
                </Text>
                <TextInput
                  ref={inputRef}
                  testID="context-size-input"
                  style={[
                    styles.textInput,
                    !isValidInput && styles.invalidInput,
                  ]}
                  keyboardType="numeric"
                  value={contextSize}
                  onChangeText={handleContextSizeChange}
                  placeholder={t(l10n.settings.contextSizePlaceholder, {
                    minContextSize: modelStore.MIN_CONTEXT_SIZE.toString(),
                  })}
                />
                {!isValidInput && (
                  <Text style={styles.errorText}>
                    {t(l10n.settings.invalidContextSizeError, {
                      minContextSize: modelStore.MIN_CONTEXT_SIZE.toString(),
                    })}
                  </Text>
                )}
                <Text variant="labelSmall" style={styles.textDescription}>
                  {l10n.settings.modelReloadNotice}
                </Text>
              </View>

              {/* Advanced Settings */}
              <List.Accordion
                testID="advanced-settings-accordion"
                title={l10n.settings.advancedSettings}
                titleStyle={styles.accordionTitle}
                style={styles.advancedAccordion}
                expanded={showAdvancedSettings}
                onPress={() => setShowAdvancedSettings(!showAdvancedSettings)}>
                <View style={styles.advancedSettingsContent}>
                  {/* Batch Size Slider */}
                  <View style={styles.settingItemContainer}>
                    <InputSlider
                      testID="batch-size-slider"
                      label={l10n.settings.batchSize}
                      value={modelStore.contextInitParams.n_batch}
                      onValueChange={value =>
                        modelStore.setNBatch(Math.round(value))
                      }
                      min={1}
                      max={4096}
                      step={1}
                    />
                    <Text variant="labelSmall" style={styles.textDescription}>
                      {t(l10n.settings.batchSizeDescription, {
                        batchSize:
                          modelStore.contextInitParams.n_batch.toString(),
                        effectiveBatch:
                          modelStore.contextInitParams.n_batch >
                          modelStore.contextInitParams.n_ctx
                            ? ` (${l10n.settings.effectiveLabel}: ${modelStore.contextInitParams.n_ctx})`
                            : '',
                      })}
                    </Text>
                  </View>
                  <Divider />

                  {/* Physical Batch Size Slider */}
                  <View style={styles.settingItemContainer}>
                    <InputSlider
                      testID="ubatch-size-slider"
                      label={l10n.settings.physicalBatchSize}
                      value={modelStore.contextInitParams.n_ubatch}
                      onValueChange={value =>
                        modelStore.setNUBatch(Math.round(value))
                      }
                      min={1}
                      max={4096}
                      step={1}
                    />
                    <Text variant="labelSmall" style={styles.textDescription}>
                      {t(l10n.settings.physicalBatchSizeDescription, {
                        physicalBatchSize:
                          modelStore.contextInitParams.n_ubatch.toString(),
                        effectivePhysicalBatch:
                          modelStore.contextInitParams.n_ubatch >
                          Math.min(
                            modelStore.contextInitParams.n_batch,
                            modelStore.contextInitParams.n_ctx,
                          )
                            ? ` (${l10n.settings.effectiveLabel}: ${Math.min(
                                modelStore.contextInitParams.n_batch,
                                modelStore.contextInitParams.n_ctx,
                              )})`
                            : '',
                      })}
                    </Text>
                  </View>
                  <Divider />

                  {/* Thread Count Slider */}
                  <View style={styles.settingItemContainer}>
                    <InputSlider
                      testID="thread-count-slider"
                      label={l10n.settings.cpuThreads}
                      value={modelStore.contextInitParams.n_threads}
                      onValueChange={value =>
                        modelStore.setNThreads(Math.round(value))
                      }
                      min={1}
                      max={modelStore.max_threads}
                      step={1}
                    />
                    <Text variant="labelSmall" style={styles.textDescription}>
                      {t(l10n.settings.cpuThreadsDescription, {
                        threads:
                          modelStore.contextInitParams.n_threads.toString(),
                        maxThreads: modelStore.max_threads.toString(),
                      })}
                    </Text>
                  </View>
                  <Divider />

                  {/* Image Max Tokens Slider */}
                  <View style={styles.settingItemContainer}>
                    <InputSlider
                      testID="image-max-tokens-slider"
                      label={l10n.settings.imageMaxTokens}
                      value={
                        modelStore.contextInitParams.image_max_tokens ?? 512
                      }
                      onValueChange={value =>
                        modelStore.setImageMaxTokens(Math.round(value))
                      }
                      min={256}
                      max={4096}
                      step={1}
                    />
                    <Text variant="labelSmall" style={styles.textDescription}>
                      {t(l10n.settings.imageMaxTokensDescription, {
                        tokens: (
                          modelStore.contextInitParams.image_max_tokens ?? 512
                        ).toString(),
                        effectiveTokens:
                          (modelStore.contextInitParams.image_max_tokens ??
                            512) > modelStore.contextInitParams.n_ctx
                            ? ` (${l10n.settings.effectiveLabel}: ${modelStore.contextInitParams.n_ctx})`
                            : '',
                      })}
                    </Text>
                  </View>
                  <Divider />

                  {/* Flash Attention Type */}
                  <View style={styles.settingItemContainer}>
                    <Text variant="titleMedium" style={styles.textLabel}>
                      {l10n.settings.flashAttention}
                    </Text>
                    <Text variant="labelSmall" style={styles.textDescription}>
                      {l10n.settings.flashAttentionAndroidDescription}
                    </Text>
                    <SegmentedButtons
                      value={
                        modelStore.contextInitParams.flash_attn_type ?? 'off'
                      }
                      onValueChange={value =>
                        modelStore.setFlashAttnType(
                          value as 'auto' | 'on' | 'off',
                        )
                      }
                      density="high"
                      buttons={(() => {
                        const currentDeviceId = getCurrentDeviceId();
                        const currentDevice = deviceOptions.find(
                          opt => opt.id === currentDeviceId,
                        );
                        const validTypes =
                          currentDevice?.valid_flash_attn_types || [
                            'auto',
                            'on',
                            'off',
                          ];

                        return [
                          {
                            value: 'auto',
                            label: l10n.settings.flashAttentionAuto,
                            disabled: !validTypes.includes('auto'),
                          },
                          {
                            value: 'on',
                            label: l10n.settings.flashAttentionOn,
                            disabled: !validTypes.includes('on'),
                          },
                          {
                            value: 'off',
                            label: l10n.settings.flashAttentionOff,
                            disabled: !validTypes.includes('off'),
                          },
                        ];
                      })()}
                      style={styles.segmentedButtons}
                    />
                  </View>
                  <Divider />

                  <CacheTypeMenuRow
                    menu={keyCacheMenu}
                    styles={styles}
                    testID="key-cache-type-button"
                    label={l10n.settings.keyCacheType}
                    description={
                      flashAttnOff
                        ? l10n.settings.keyCacheTypeDisabledDescription
                        : l10n.settings.keyCacheTypeDescription
                    }
                    value={modelStore.contextInitParams.cache_type_k}
                    valueLabel={getCacheTypeLabel(
                      modelStore.contextInitParams.cache_type_k,
                      false,
                    )}
                    options={cacheTypeKOptions}
                    disabled={flashAttnOff}
                    onSelect={value => modelStore.setCacheTypeK(value)}
                  />
                  <Divider />

                  <CacheTypeMenuRow
                    menu={valueCacheMenu}
                    styles={styles}
                    testID="value-cache-type-button"
                    label={l10n.settings.valueCacheType}
                    description={
                      flashAttnOff
                        ? l10n.settings.valueCacheTypeDisabledDescription
                        : l10n.settings.valueCacheTypeDescription
                    }
                    value={modelStore.contextInitParams.cache_type_v}
                    valueLabel={getCacheTypeLabel(
                      modelStore.contextInitParams.cache_type_v,
                      true,
                    )}
                    options={cacheTypeVOptions}
                    disabled={flashAttnOff}
                    onSelect={value => modelStore.setCacheTypeV(value)}
                  />
                  <Divider />

                  {/* Speculative Decoding (draft model) */}
                  <View style={styles.settingItemContainer}>
                    <View style={styles.switchContainer}>
                      <View style={styles.textContainer}>
                        <Text variant="titleMedium" style={styles.textLabel}>
                          {l10n.settings.speculativeDecoding}
                        </Text>
                        <Text
                          variant="labelSmall"
                          style={styles.textDescription}>
                          {l10n.settings.speculativeDecodingDescription}
                        </Text>
                      </View>
                      <Switch
                        testID="speculative-decoding-switch"
                        value={speculativeEnabled}
                        accessibilityLabel={l10n.settings.speculativeDecoding}
                        accessibilityHint={
                          l10n.settings.speculativeDecodingDescription
                        }
                        onValueChange={value =>
                          modelStore.setSpeculativeEnabled(value)
                        }
                      />
                    </View>
                    {showSpeculativeNoEffectNote && (
                      <Text
                        variant="labelSmall"
                        style={styles.textDescription}
                        testID="speculative-no-effect-note">
                        {l10n.settings.speculativeNotMTPCapable}
                      </Text>
                    )}
                  </View>

                  {speculativeEnabled && (
                    <>
                      <Divider />

                      {/* Draft Model Picker: full-row control — model names
                          are too long to share a row with the title. */}
                      <View style={styles.settingItemContainer}>
                        <Text variant="titleMedium" style={styles.textLabel}>
                          {l10n.settings.speculativeDraftModel}
                        </Text>
                        <Text
                          variant="labelSmall"
                          style={styles.textDescription}>
                          {l10n.settings.speculativeDraftModelDescription}
                        </Text>
                        <View style={styles.fullRowControl}>
                          <View>
                            <Button
                              ref={draftModelMenu.buttonRef}
                              mode="outlined"
                              onPress={draftModelMenu.open}
                              style={styles.menuButton}
                              contentStyle={styles.buttonContent}
                              testID="speculative-draft-model-picker"
                              accessibilityLabel={`${
                                l10n.settings.speculativeDraftModel
                              }, ${
                                selectedDraftModel?.name ??
                                l10n.settings.speculativeDraftModelNone
                              }`}
                              accessibilityHint={
                                l10n.settings.speculativeDraftModelDescription
                              }
                              icon={({size, color}) => (
                                <Icon
                                  source="chevron-down"
                                  size={size}
                                  color={color}
                                />
                              )}>
                              {selectedDraftModel?.name ??
                                l10n.settings.speculativeDraftModelNone}
                            </Button>
                            <Menu
                              visible={draftModelMenu.visible}
                              onDismiss={draftModelMenu.close}
                              anchor={draftModelMenu.anchor}
                              selectable>
                              <Menu.Item
                                style={styles.menu}
                                label={l10n.settings.speculativeDraftModelNone}
                                selected={!selectedDraftModel}
                                onPress={() => {
                                  modelStore.setSelectedDraftModel(undefined);
                                  draftModelMenu.close();
                                }}
                              />
                              {eligibleDraftModels.map(model => (
                                <Menu.Item
                                  key={model.id}
                                  style={styles.menu}
                                  label={model.name}
                                  selected={model.id === selectedDraftModel?.id}
                                  onPress={() => {
                                    modelStore.setSelectedDraftModel(model.id);
                                    draftModelMenu.close();
                                  }}
                                />
                              ))}
                            </Menu>
                          </View>
                        </View>
                        {draftPickIgnoredNote !== undefined && (
                          <Text
                            variant="labelSmall"
                            style={styles.textDescription}
                            testID="speculative-draft-model-ignored-note">
                            {draftPickIgnoredNote}
                          </Text>
                        )}
                      </View>
                      <Divider />

                      {/* Draft GPU Layers Slider */}
                      <View style={styles.settingItemContainer}>
                        <Text variant="titleMedium" style={styles.textLabel}>
                          {l10n.settings.speculativeDraftNGpuLayers}
                        </Text>
                        <Text
                          variant="labelSmall"
                          style={styles.textDescription}>
                          {l10n.settings.speculativeDraftNGpuLayersDescription}
                        </Text>
                        <InputSlider
                          testID="speculative-draft-gpu-layers-slider"
                          accessibilityLabel={
                            l10n.settings.speculativeDraftNGpuLayers
                          }
                          value={
                            modelStore.contextInitParams
                              .spec_draft_n_gpu_layers ?? 99
                          }
                          onValueChange={value =>
                            modelStore.setSpecDraftNGpuLayers(Math.round(value))
                          }
                          min={0}
                          max={99}
                          step={1}
                        />
                      </View>
                      <Divider />

                      <CacheTypeMenuRow
                        menu={draftKeyCacheMenu}
                        styles={styles}
                        testID="speculative-draft-key-cache-button"
                        label={l10n.settings.speculativeDraftKeyCacheType}
                        description={
                          draftMode === 'off'
                            ? l10n.settings
                                .speculativeDraftCacheTypeInactiveDescription
                            : undefined
                        }
                        value={
                          modelStore.contextInitParams.spec_draft_cache_type_k
                        }
                        valueLabel={getDraftCacheTypeLabel(
                          modelStore.contextInitParams.spec_draft_cache_type_k,
                          false,
                        )}
                        options={draftCacheTypeKOptions}
                        disabled={draftMode === 'off'}
                        onSelect={value =>
                          modelStore.setSpecDraftCacheTypeK(value)
                        }
                      />
                      <Divider />

                      <CacheTypeMenuRow
                        menu={draftValueCacheMenu}
                        styles={styles}
                        testID="speculative-draft-value-cache-button"
                        label={l10n.settings.speculativeDraftValueCacheType}
                        description={
                          draftMode === 'off'
                            ? l10n.settings
                                .speculativeDraftCacheTypeInactiveDescription
                            : undefined
                        }
                        value={
                          modelStore.contextInitParams.spec_draft_cache_type_v
                        }
                        valueLabel={getDraftCacheTypeLabel(
                          modelStore.contextInitParams.spec_draft_cache_type_v,
                          true,
                        )}
                        options={draftCacheTypeVOptions}
                        disabled={draftMode === 'off'}
                        onSelect={value =>
                          modelStore.setSpecDraftCacheTypeV(value)
                        }
                      />
                    </>
                  )}
                </View>
              </List.Accordion>
            </Card.Content>
          </Card>

          {/* Memory Settings */}
          <Card elevation={0} style={styles.card}>
            <Card.Title title={l10n.settings.memorySettings} />
            <Card.Content>
              <View style={styles.settingItemContainer}>
                {/* Use Memory Lock */}
                <View style={styles.switchContainer}>
                  <View style={styles.textContainer}>
                    <Text variant="titleMedium" style={styles.textLabel}>
                      {l10n.settings.useMlock}
                    </Text>
                    <Text variant="labelSmall" style={styles.textDescription}>
                      {l10n.settings.useMlockDescription}
                    </Text>
                  </View>
                  <Switch
                    testID="use-mlock-switch"
                    value={modelStore.contextInitParams.use_mlock}
                    onValueChange={value => modelStore.setUseMlock(value)}
                  />
                </View>
              </View>
              <Divider />

              {/* Memory Mapping */}
              <View style={styles.settingItemContainer}>
                <View style={styles.switchContainer}>
                  <View style={styles.textContainer}>
                    <Text variant="titleMedium" style={styles.textLabel}>
                      {l10n.settings.useMmap}
                    </Text>
                    <Text variant="labelSmall" style={styles.textDescription}>
                      {l10n.settings.useMmapDescription}
                    </Text>
                  </View>
                  <Switch
                    testID="use-mmap-switch"
                    value={
                      modelStore.contextInitParams.use_mmap !== 'false' &&
                      modelStore.contextInitParams.use_mmap !== 'smart'
                    }
                    onValueChange={value =>
                      modelStore.setUseMmap(value ? 'true' : 'false')
                    }
                  />
                </View>
              </View>
              <Divider />

              {/* Enable Weight Repacking (Android only) */}
              {Platform.OS === 'android' && (
                <View style={styles.settingItemContainer}>
                  <View style={styles.switchContainer}>
                    <View style={styles.textContainer}>
                      <Text variant="titleMedium" style={styles.textLabel}>
                        {l10n.settings.weightRepacking}
                      </Text>
                      <Text variant="labelSmall" style={styles.textDescription}>
                        {l10n.settings.weightRepackingDescription}
                      </Text>
                    </View>
                    <Switch
                      testID="weight-repacking-switch"
                      value={
                        !(modelStore.contextInitParams.no_extra_bufts ?? false)
                      }
                      onValueChange={value =>
                        modelStore.setNoExtraBufts(!value)
                      }
                    />
                  </View>
                </View>
              )}
              {Platform.OS === 'android' && <Divider />}

              <Text variant="labelSmall" style={styles.textDescription}>
                {l10n.settings.modelReloadNotice}
              </Text>
            </Card.Content>
          </Card>

          {/* Model Loading Settings */}
          <Card elevation={0} style={styles.card}>
            <Card.Title title={l10n.settings.modelLoadingSettings} />
            <Card.Content>
              <View style={styles.settingItemContainer}>
                {/* Auto Offload/Load */}
                <View style={styles.switchContainer}>
                  <View style={styles.textContainer}>
                    <Text variant="titleMedium" style={styles.textLabel}>
                      {l10n.settings.autoOffloadLoad}
                    </Text>
                    <Text variant="labelSmall" style={styles.textDescription}>
                      {l10n.settings.autoOffloadLoadDescription}
                    </Text>
                  </View>
                  <Switch
                    testID="auto-offload-load-switch"
                    value={modelStore.useAutoRelease}
                    onValueChange={value =>
                      modelStore.updateUseAutoRelease(value)
                    }
                  />
                </View>
                <Divider />

                {/* Auto Navigate to Chat */}
                <View style={styles.switchContainer}>
                  <View style={styles.textContainer}>
                    <Text variant="titleMedium" style={styles.textLabel}>
                      {l10n.settings.autoNavigateToChat}
                    </Text>
                    <Text variant="labelSmall" style={styles.textDescription}>
                      {l10n.settings.autoNavigateToChatDescription}
                    </Text>
                  </View>
                  <Switch
                    testID="auto-navigate-to-chat-switch"
                    value={uiStore.autoNavigatetoChat}
                    onValueChange={value =>
                      uiStore.setAutoNavigateToChat(value)
                    }
                  />
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* UI Settings */}
          <Card elevation={0} style={styles.card}>
            <Card.Title title={l10n.settings.appSettings} />
            <Card.Content>
              <View style={styles.settingItemContainer}>
                {/* Dark Mode */}
                <View style={styles.switchContainer}>
                  <View style={styles.textContainer}>
                    <View style={styles.labelWithIconContainer}>
                      <MoonIcon
                        width={20}
                        height={20}
                        style={styles.settingIcon}
                        stroke={theme.colors.onSurface}
                      />
                      <Text variant="titleMedium" style={styles.textLabel}>
                        {l10n.settings.darkMode}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    testID="dark-mode-switch"
                    value={uiStore.colorScheme === 'dark'}
                    onValueChange={value =>
                      uiStore.setColorScheme(value ? 'dark' : 'light')
                    }
                  />
                </View>
                <Divider />
              </View>
            </Card.Content>
          </Card>

          {/* API Settings */}
          <Card elevation={0} style={styles.card}>
            <Card.Title title={l10n.settings.apiSettingsTitle} />
            <Card.Content>
              <View style={styles.settingItemContainer}>
                {/* Hugging Face Token */}
                <View style={styles.switchContainer}>
                  <View style={styles.textContainer}>
                    <Text variant="titleMedium" style={styles.textLabel}>
                      {l10n.settings.huggingFaceTokenLabel}
                    </Text>
                    <Text variant="labelSmall" style={styles.textDescription}>
                      {hfStore.isTokenPresent
                        ? l10n.settings.tokenIsSetDescription
                        : l10n.settings.setTokenDescription}
                    </Text>
                  </View>
                  <Button
                    mode="outlined"
                    onPress={() => setShowHfTokenDialog(true)}
                    style={styles.menuButton}>
                    {hfStore.isTokenPresent
                      ? l10n.common.update
                      : l10n.settings.setTokenButton}
                  </Button>
                </View>

                {/* Use HF Token Switch */}
                <Divider style={styles.divider} />
                <View style={styles.switchContainer}>
                  <View style={styles.textContainer}>
                    <Text variant="titleMedium" style={styles.textLabel}>
                      {l10n.settings.useHfTokenLabel}
                    </Text>
                    <Text variant="labelSmall" style={styles.textDescription}>
                      {l10n.settings.useHfTokenDescription}
                    </Text>
                  </View>
                  <Switch
                    testID="use-hf-token-switch"
                    value={hfStore.useHfToken}
                    disabled={!hfStore.isTokenPresent}
                    onValueChange={value => hfStore.setUseHfToken(value)}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Export Options */}
          <Card elevation={0} style={styles.card}>
            <Card.Title title={l10n.settings.exportOptions} />
            <Card.Content>
              <View style={styles.settingItemContainer}>
                {/* Legacy Export */}
                <View style={styles.switchContainer}>
                  <View style={styles.textContainer}>
                    <View style={styles.labelWithIconContainer}>
                      <ShareIcon
                        width={20}
                        height={20}
                        style={styles.settingIcon}
                        stroke={theme.colors.onSurface}
                      />
                      <Text variant="titleMedium" style={styles.textLabel}>
                        {l10n.settings.exportLegacyChats}
                      </Text>
                    </View>
                    <Text variant="labelSmall" style={styles.textDescription}>
                      {l10n.settings.exportLegacyChatsDescription}
                    </Text>
                  </View>
                  <Button
                    mode="outlined"
                    onPress={async () => {
                      try {
                        await exportLegacyChatSessions();
                      } catch {
                        Alert.alert(
                          'Export Error',
                          'Failed to export legacy chat sessions. The file may not exist.',
                        );
                      }
                    }}
                    style={styles.menuButton}>
                    {l10n.settings.exportButton}
                  </Button>
                </View>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </TouchableWithoutFeedback>
      <HFTokenSheet
        isVisible={showHfTokenDialog}
        onDismiss={() => setShowHfTokenDialog(false)}
        onSave={() => setShowHfTokenDialog(false)}
      />
    </SafeAreaView>
  );
});

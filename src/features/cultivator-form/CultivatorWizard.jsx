'use client';

import React, { useState, useEffect } from 'react';
import {
  Row,
  Form as ReactstrapForm,
  Spinner,
  Table,
  Button,
} from 'reactstrap';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Btn from '@/elements/buttons/Btn';
import RHFSimpleInputField from '@/components/common/inputFields/RHFSimpleInputField';
import RHFInputField from '@/components/common/inputFields/RHFInputField';
import WrapperComponent from '@/components/common/WrapperComponent';
import { useTranslation } from '@/utils/translations';
import { FiTrash } from 'react-icons/fi';
import { useCultivatorAddForm } from '@/utils/hooks/useCultivator';
import SuccessModal from '@/components/common/SuccessModal';
import { capitalizeWords } from '@/utils/customFunctions/Capitalize';

// --- VALIDATION SCHEMA ---
const cultivatorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name is required')
    .max(30, 'Name cannot exceed 30 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can contain only letters'),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number'),
  // email: z.string().email('Enter a valid email address').or(z.literal('')),
  email: z
    .string()
    .trim()
    .refine(
      (val) => val === '' || z.string().email().safeParse(val).success,
      'Enter a valid email address'
    ),
  address: z.string().trim().min(5, 'Address is required'),

  medicinalPlants: z
    .array(
      z.object({
        itemName: z.string().trim().min(1, 'Item name is required'),
        part: z.string().trim().optional(),
        quantity: z
          .string()
          .trim()
          .min(1, 'Quantity is required')
          .refine(
            (val) => !isNaN(Number(val)) && Number(val) > 0,
            'Quantity must be greater than 0'
          ),
        packing: z.string().trim().optional(),
        harvestDate: z.string().trim().optional(),
      })
    )
    .min(1, 'At least one plant is required'),

  location: z.string().trim().optional(),
  distHighway: z.string().trim().optional(),
  distCity: z.string().trim().optional(),
  area: z.string().trim().optional(),
  soilType: z.string().trim().optional(),
  temperature: z.string().trim().optional(),
  rainfall: z.string().trim().optional(),
  irrigationSource: z.string().trim().optional(),
  otherCropsSite: z.string().trim().optional(),
  otherCropsVicinity: z.string().trim().optional(),

  plantingMaterial: z.string().trim().optional(),
  materialSource: z.string().trim().optional(),
  isCertified: z.string().trim().optional(),
  certifyingBody: z.string().trim().optional(),
  dateOfPlanting: z.string().trim().optional(),
  ageAtHarvest: z.string().trim().optional(),
  harvestSeason: z.string().trim().optional(),
  isOrganic: z.string().trim().optional(),
  isOrganicCertified: z.string().trim().optional(),
  organicCertifyingBody: z.string().trim().optional(),
  fertilizers: z.string().trim().optional(),
  pesticides: z.string().trim().optional(),
  herbicides: z.string().trim().optional(),
  postHarvestProcessing: z.string().trim().optional(),
  cleaning: z.string().trim().optional(),
  washing: z.string().trim().optional(),
  drying: z.string().trim().optional(),
  sorting: z.string().trim().optional(),
  packing: z.string().trim().optional(),
});

const CultivatorRegistrationForm = () => {
  const { t } = useTranslation('common');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { mutateAsync: submitCultivatorForm, isPending } =
    useCultivatorAddForm();

  // --- FORM SETUP ---
  const methods = useForm({
    resolver: zodResolver(cultivatorSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      email: '',
      address: '',
      medicinalPlants: [
        { itemName: '', part: '', quantity: '', packing: '', harvestDate: '' },
      ],
      location: '',
      distHighway: '',
      distCity: '',
      area: '',
      soilType: '',
      temperature: '',
      rainfall: '',
      irrigationSource: '',
      otherCropsSite: '',
      otherCropsVicinity: '',
      plantingMaterial: '',
      materialSource: '',
      isCertified: '',
      certifyingBody: '',
      dateOfPlanting: '',
      ageAtHarvest: '',
      harvestSeason: '',
      isOrganic: '',
      isOrganicCertified: '',
      organicCertifyingBody: '',
      fertilizers: '',
      pesticides: '',
      herbicides: '',
      postHarvestProcessing: '',
      cleaning: '',
      washing: '',
      drying: '',
      sorting: '',
      packing: '',
    },
    mode: 'onChange',
  });

  const {
    formState: { errors },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'medicinalPlants',
  });

  // --- SUBMISSION HANDLER ---
  const onSubmit = async (formData) => {
    const payload = {
      personalDetails: {
        farmerName: capitalizeWords(formData.name),
        contactNumber: formData.phoneNumber,
        email: formData.email,
        address: formData.address,
      },

      medicinalPlants: formData.medicinalPlants.map((plant, index) => ({
        id: index + 1,
        itemName: plant.itemName,
        part: plant.part,
        quantity: plant.quantity,
        packing: plant.packing,
        harvestDate: plant.harvestDate,
      })),

      siteAndClimateDetails: {
        location: formData.location,
        distHighway: formData.distHighway,
        distCity: formData.distCity,
        areaAcres: formData.area,
        soilType: formData.soilType,
        temperature: formData.temperature,
        rainfall: formData.rainfall,
        irrigationSource: formData.irrigationSource,
        otherCropsSite: formData.otherCropsSite,
        otherCropsVicinity: formData.otherCropsVicinity,
      },

      cultivationDetails: {
        plantingMaterial: formData.plantingMaterial,
        materialSource: formData.materialSource,

        isCertified:
          formData.isCertified === '' ? null : formData.isCertified === 'yes',

        certifyingBody: formData.certifyingBody,

        plantingDate: formData.dateOfPlanting,

        harvestAge: formData.ageAtHarvest,
        harvestSeason: formData.harvestSeason,

        isOrganic:
          formData.isOrganic === '' ? null : formData.isOrganic === 'yes',

        isOrganicCertified:
          formData.isOrganicCertified === ''
            ? null
            : formData.isOrganicCertified === 'yes',

        organicCertifyingBody: formData.organicCertifyingBody,

        fertilizers: formData.fertilizers,
        pesticides: formData.pesticides,
        herbicides: formData.herbicides,

        postHarvestProcess: formData.postHarvestProcessing,
        cleaning: formData.cleaning,
        washing: formData.washing,
        drying: formData.drying,
        sorting: formData.sorting,
        packing: formData.packing,
      },
    };

    try {
      const response = await submitCultivatorForm(payload);
      // console.log('Cultivator form submitted:', response);
      methods.reset();
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Cultivator form submission failed:', error);
    }
  };

  // useEffect(() => {
  //   const firstErrorField = Object.keys(errors)[0];

  //   if (firstErrorField) {
  //     const element = document.querySelector(`[name="${firstErrorField}"]`);

  //     if (element) {
  //       element.scrollIntoView({
  //         behavior: 'smooth',
  //         block: 'center',
  //       });

  //       element.focus();
  //     }
  //   }
  // }, [errors]);

  const getFirstErrorField = (obj, parent = '') => {
    for (const key in obj) {
      const path = parent ? `${parent}.${key}` : key;

      if (obj[key]?.message) return path;

      if (typeof obj[key] === 'object') {
        const nested = getFirstErrorField(obj[key], path);
        if (nested) return nested;
      }
    }
  };

  useEffect(() => {
    const firstError = getFirstErrorField(errors);

    if (!firstError) return;

    const element = document.querySelector(`[name="${firstError}"]`);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      element.focus();
    }
  }, [errors]);

  return (
    <>
      <WrapperComponent
        classes={{
          sectionClass: 'section-b-space',
        }}
        noRowCol={true}
      >
        <div className="events-header">
          <h1 className="events-title">{t('Cultivator Registration')}</h1>
          <p className="events-subtitle">
            {t(
              'Register as a medicinal herb cultivator with Shree Dhootapapeshwar Limited and explore partnering opportunities for herb supply.'
            )}
          </p>
        </div>

        <div className="p-3 p-md-4 bg-white rounded shadow-sm border">
          <h2 className="mb-2">{t('Farmer Registration')}</h2>
          <p className="text-muted border-bottom pb-3 mb-4">
            {t(
              'Please complete all sections to register your agricultural details.'
            )}
          </p>

          <FormProvider {...methods}>
            <ReactstrapForm
              noValidate
              onSubmit={methods.handleSubmit(onSubmit)}
            >
              {/* =========================================
              1. PERSONAL DETAILS
          ========================================= */}
              <h4 className="mb-4 text-secondary">1. Personal Details</h4>
              <Row>
                <RHFSimpleInputField
                  nameList={[
                    {
                      name: 'name',
                      className: 'contact-us-form-input',
                      placeholder: t('Enter your name'),
                      toplabel: 'Name of Farmer',
                      require: 'true',
                      onInput: (e) => {
                        let cleanedValue = e.target.value.replace(
                          /[^a-zA-Z\s]/g,
                          ''
                        );
                        e.target.value = capitalizeWords(cleanedValue).slice(
                          0,
                          30
                        );
                      },
                      colprops: { xxl: 6, sm: 6 },
                    },
                    {
                      name: 'phoneNumber',
                      className: 'contact-us-form-input',
                      placeholder: t('Enter your phone number'),
                      toplabel: 'Contact Number',
                      require: 'true',
                      type: 'tel',
                      inputMode: 'numeric',
                      maxLength: 10,
                      inputaddon: true,
                      prefixvalue: '+91',
                      colprops: { xxl: 6, sm: 6 },
                      onInput: (e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 0 && !/^[6-9]/.test(val[0])) {
                          val = val.substring(1);
                        }
                        e.target.value = val.slice(0, 10);
                      },
                    },
                    {
                      name: 'email',
                      className: 'contact-us-form-input',
                      placeholder: t('Enter your email'),
                      toplabel: 'Email',
                      colprops: { xs: 12 },
                    },
                    {
                      name: 'address',
                      className: 'contact-us-form-input',
                      placeholder: t('Enter your complete address'),
                      toplabel: 'Address',
                      require: 'true',
                      type: 'textarea',
                      rows: 3,
                      colprops: { xs: 12 },
                    },
                  ]}
                />
              </Row>

              {/* =========================================
              2. MEDICINAL PLANTS (DYNAMIC TABLE)
          ========================================= */}
              <h4 className="mb-4 mt-5 text-secondary">
                2. Medicinal Plant(s) Offered
              </h4>
              <div className="table-responsive mb-3 border rounded">
                <Table bordered hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ minWidth: '200px' }}>
                        Item Name <span className="text-danger">*</span>
                      </th>
                      <th style={{ minWidth: '150px' }}>Part</th>
                      <th style={{ minWidth: '150px' }}>
                        Quantity <span className="text-danger">*</span>
                      </th>
                      <th style={{ minWidth: '150px' }}>Packing</th>
                      <th style={{ minWidth: '180px' }}>Month/Year Harvest</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((item, index) => (
                      <tr key={item.id}>
                        <td>
                          <RHFInputField
                            className={`cultivator-form__input`}
                            name={`medicinalPlants.${index}.itemName`}
                            notitle="true"
                            placeholder="e.g. Ashwagandha"
                          />
                        </td>
                        <td>
                          <RHFInputField
                            className={`cultivator-form__input`}
                            name={`medicinalPlants.${index}.part`}
                            notitle="true"
                            placeholder="e.g. Roots, Leaves"
                          />
                        </td>
                        <td>
                          <RHFInputField
                            className={`cultivator-form__input`}
                            name={`medicinalPlants.${index}.quantity`}
                            notitle="true"
                            type="text"
                            inputaddon={true}
                            postprefix="kg"
                            placeholder="e.g. 50"
                            inputMode="numeric"
                            onInput={(e) => {
                              e.target.value = e.target.value.replace(
                                /[^\d]/g,
                                ''
                              );
                            }}
                          />
                        </td>
                        <td>
                          <RHFInputField
                            className={`cultivator-form__input`}
                            name={`medicinalPlants.${index}.packing`}
                            notitle="true"
                            placeholder="e.g. Gunny Bags"
                          />
                        </td>
                        <td>
                          <RHFInputField
                            className={`cultivator-form__input`}
                            name={`medicinalPlants.${index}.harvestDate`}
                            notitle="true"
                            type="month"
                            placeholder="Select harvest month and year"
                          />
                        </td>
                        <td className="text-center align-middle">
                          <Button
                            color="danger"
                            outline
                            size="sm"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                          >
                            <FiTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <Button
                // color="secondary"
                outline
                size="sm"
                onClick={() =>
                  append({
                    itemName: '',
                    part: '',
                    quantity: '',
                    packing: '',
                    harvestDate: '',
                  })
                }
              >
                + Add Another Plant
              </Button>

              {/* =========================================
              3. SITE & CLIMATE DETAILS
          ========================================= */}
              <h4 className="mb-4 mt-5 text-secondary">
                3. Site details & Soil & Climate details
              </h4>
              <Row>
                <RHFSimpleInputField
                  nameList={[
                    {
                      name: 'location',
                      className: 'contact-us-form-input',
                      placeholder: t('Enter farm location'),
                      toplabel: 'Location',
                      toplabel: 'Farm Location',
                      colprops: { xs: 12 },
                    },
                    {
                      name: 'distHighway',
                      className: 'contact-us-form-input',
                      placeholder: t('Enter distance'),
                      toplabel: 'Distance from Nearest Highway/Industrial Area',
                      inputaddon: true,
                      postprefix: 'km',
                      type: 'number',
                      colprops: { md: 4 },
                    },
                    {
                      name: 'distCity',
                      className: 'contact-us-form-input',
                      placeholder: t('Enter distance'),
                      toplabel: 'Distance from Nearest Town/City',
                      inputaddon: true,
                      postprefix: 'km',
                      type: 'number',
                      colprops: { md: 4 },
                    },
                    {
                      name: 'area',
                      className: 'contact-us-form-input',
                      placeholder: t('Enter area'),
                      toplabel: 'Cultivation Area',
                      inputaddon: true,
                      postprefix: 'acres',
                      type: 'number',
                      colprops: { md: 4 },
                    },

                    {
                      name: 'soilType',
                      className: 'contact-us-form-input',
                      placeholder: t('e.g. Sandy Loam, Black Soil'),
                      toplabel: 'Soil Type',
                      colprops: { md: 4 },
                    },
                    {
                      name: 'temperature',
                      className: 'contact-us-form-input',
                      placeholder: t('e.g. 20–25'),
                      toplabel: 'Average Temperature',
                      inputaddon: true,
                      postprefix: '°C',
                      colprops: { md: 4 },
                    },
                    {
                      name: 'rainfall',
                      className: 'contact-us-form-input',
                      placeholder: t('e.g. 100–150'),
                      toplabel: 'Average Annual Rainfall',
                      inputaddon: true,
                      postprefix: 'mm',
                      colprops: { md: 4 },
                    },

                    {
                      name: 'irrigationSource',
                      className: 'contact-us-form-input',
                      placeholder: t('e.g. Borewell, Canal, Drip Irrigation'),
                      toplabel: 'Source of Irrigation',
                      colprops: { md: 4 },
                    },
                    {
                      name: 'otherCropsSite',
                      className: 'contact-us-form-input',
                      placeholder: t('e.g. Wheat, Soybean'),
                      toplabel: 'Other Crops Cultivated at the Site',
                      colprops: { md: 4 },
                    },
                    {
                      name: 'otherCropsVicinity',
                      className: 'contact-us-form-input',
                      placeholder: t('e.g. Sugarcane, Cotton'),
                      toplabel: 'Other Crops in Nearby Areas',
                      colprops: { md: 4 },
                    },
                  ]}
                />
              </Row>

              {/* =========================================
              4. CULTIVATION DETAILS
          ========================================= */}
              <h4 className="mb-4 mt-5 text-secondary">
                4. Cultivation Details
              </h4>
              <Row>
                <RHFSimpleInputField
                  nameList={[
                    {
                      name: 'plantingMaterial',
                      className: 'contact-us-form-input',
                      placeholder: t('e.g. Seeds, Saplings, Cuttings'),
                      toplabel: 'Type of Planting Material',
                      colprops: { md: 4 },
                    },
                    {
                      name: 'materialSource',
                      className: 'contact-us-form-input',
                      placeholder: t(
                        'e.g. Local Market, Own Farm, Government Agency'
                      ),
                      toplabel: 'Source of Planting Material',
                      colprops: { md: 4 },
                    },

                    {
                      name: 'isCertified',
                      className: 'contact-us-form-input',
                      toplabel: 'Is the Planting Material Certified?',
                      type: 'select',
                      colprops: { md: 4 },
                      children: (
                        <>
                          <option value="">Select certification status</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </>
                      ),
                    },
                    {
                      name: 'certifyingBody',
                      className: 'contact-us-form-input',
                      placeholder: t('Enter certifying body name'),
                      toplabel: 'Certifying Body (if applicable)',
                      colprops: { md: 4 },
                    },

                    {
                      name: 'dateOfPlanting',
                      className: 'contact-us-form-input',
                      toplabel: 'Planting Date',
                      type: 'date',
                      colprops: { md: 4 },
                    },
                    {
                      name: 'ageAtHarvest',
                      className: 'contact-us-form-input',
                      placeholder: t('e.g. 6 months, 90 days'),
                      toplabel: 'Crop Age at Harvest',
                      colprops: { md: 4 },
                    },
                    {
                      name: 'harvestSeason',
                      className: 'contact-us-form-input',
                      placeholder: t('e.g. Kharif, Rabi'),
                      toplabel: 'Harvest Season',
                      colprops: { md: 4 },
                    },

                    {
                      name: 'isOrganic',
                      className: 'contact-us-form-input',
                      toplabel: 'Whether Organic/Non-Organic',
                      type: 'select',
                      colprops: { md: 4 },
                      children: (
                        <>
                          <option value="">Select...</option>
                          <option value="yes">Yes (Organic)</option>
                          <option value="no">No (Non-Organic)</option>
                        </>
                      ),
                    },
                    {
                      name: 'isOrganicCertified',
                      className: 'contact-us-form-input',
                      toplabel: 'Whether Certified (Organic)',
                      type: 'select',
                      colprops: { md: 4 },
                      children: (
                        <>
                          <option value="">Select...</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </>
                      ),
                    },
                    {
                      name: 'organicCertifyingBody',
                      className: 'contact-us-form-input',
                      placeholder: t('Enter certifying body name'),
                      toplabel: 'If yes, Certifying Body',
                      colprops: { md: 4 },
                    },

                    {
                      name: 'fertilizers',
                      className: 'contact-us-form-input',
                      placeholder: t('e.g. Urea, DAP, Compost'),
                      toplabel: 'Fertilizers Applied',
                      colprops: { md: 4 },
                    },
                    {
                      name: 'pesticides',
                      className: 'contact-us-form-input',
                      placeholder: t('e.g. Neem Oil, Chlorpyrifos'),
                      toplabel: 'Pesticides Applied',
                      colprops: { md: 4 },
                    },
                    {
                      name: 'herbicides',
                      className: 'contact-us-form-input',
                      placeholder: t('e.g. Glyphosate, Manual Weeding'),
                      toplabel: 'Herbicides Applied',
                      colprops: { md: 4 },
                    },

                    {
                      name: 'postHarvestProcessing',
                      className: 'contact-us-form-input',
                      placeholder: t('Describe post-harvest processing'),
                      toplabel: 'Post-Harvest Processing',
                      colprops: { md: 4 },
                    },
                    {
                      name: 'cleaning',
                      className: 'contact-us-form-input',
                      placeholder: t('e.g. Manual Sorting, Winnowing'),
                      toplabel: 'Cleaning Method',
                      colprops: { md: 4 },
                    },
                    {
                      name: 'washing',
                      className: 'contact-us-form-input',
                      placeholder: t('e.g. Clean Water Rinse'),
                      toplabel: 'Washing Method',
                      colprops: { md: 4 },
                    },
                    {
                      name: 'drying',
                      className: 'contact-us-form-input',
                      placeholder: t('e.g. Sun Drying, Shade Drying'),
                      toplabel: 'Drying Method',
                      colprops: { md: 4 },
                    },
                    {
                      name: 'sorting',
                      className: 'contact-us-form-input',
                      placeholder: t('e.g. Size Grading, Quality Grading'),
                      toplabel: 'Sorting Method',
                      colprops: { md: 4 },
                    },
                    {
                      name: 'packing',
                      className: 'contact-us-form-input',
                      placeholder: t('e.g. 50 kg Jute Bags, Plastic Sacks'),
                      toplabel: 'Packaging Method',
                      colprops: { md: 4 },
                    },
                  ]}
                />
              </Row>

              {/* --- SUBMIT BUTTON --- */}
              <div className="d-flex justify-content-center">
                <Btn
                  color="primary"
                  size="lg"
                  className="px-5 py-2"
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Spinner style={{ width: '1.2rem', height: '1.2rem' }} />
                  ) : (
                    t('Submit')
                  )}
                </Btn>
              </div>
            </ReactstrapForm>
          </FormProvider>
        </div>
      </WrapperComponent>
      <SuccessModal
        modal={showSuccessModal}
        setModal={setShowSuccessModal}
        title="Thank You!"
        message="Thank you for registering. Your cultivation details have been submitted successfully."
        // onClose={() => {
        //   // Optional actions after modal close
        // }}
      />
    </>
  );
};

export default CultivatorRegistrationForm;

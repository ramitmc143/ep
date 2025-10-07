import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import {ScaledSheet} from 'react-native-size-matters';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useFocusEffect} from '@react-navigation/native';
import { getDeviceId } from '../deviceDetails/DeviceId';

const DSC = ({route}) => {

  const {api_link, lang_id: paramLangId, year: paramYear} = route?.params || {};
  const [activeTab, setActiveTab] = useState('స్టడీ మెటీరియల్'); //Study Material


const deviceId = getDeviceId();
  
  
  if (!deviceId) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const Topics = 'ఎస్‌ఏ/ఎస్జీటీ/పండీట్‌';
  const SubTopics = 'సబ్జెక్టులు';
  const Chapters = 'పాఠాలు';
  const SubChapters = 'మౌలికాంశాలు';
  const Group = 'బిట్‌బ్యాంకులు';

  const [data, setData] = useState({
    'స్టడీ మెటీరియల్': [], // Study Material
    'నమూనా ప్రశ్నపత్రాలు': [], // Model Paper
    'పాత ప్రశ్నపత్రాలు': [], // Previous Paper
  });

  const [selectedTitles, setSelectedTitles] = useState({
    topics: Topics,
    subTopics: SubTopics,
    chapters: Chapters,
    subChapters: SubChapters,
    studyMaterial: Group,
  });

  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [yearDropdownVisible, setYearDropdownVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState(paramYear || 2019);
  const yearList = Array.from({length: 20}, (_, i) => 2024 - i);

  const langId = paramLangId || 2;
  const year = selectedYear;

  const [expandedTopics, setExpandedTopics] = useState({});
  const [studyMaterialTopics, setStudyMaterialTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [subTopics, setSubTopics] = useState([]);
  const [selectedSubTopicId, setSelectedSubTopicId] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [subChapters, setSubChapters] = useState([]);
  const [groupList, setGroupList] = useState([]);

  const toggleTopic = async (type, id) => {
    if (
      id === 'topics' ||
      id === 'subTopics' ||
      id === 'chapters' ||
      id === 'subChapters'
    ) {
      setExpandedTopics(prev => ({
        ...prev,
        [type]: !prev[type],
      }));
      return;
    }

    // Common reset structure
    const resetExpanded = {
      topics: false,
      subTopics: false,
      chapters: false,
      subChapters: false,
      studyMaterial: false,
    };

    const resetTitles = {
      topics: selectedTitles.topics,
      subTopics: SubTopics,
      chapters: Chapters,
      subChapters: SubChapters,
      studyMaterial: Group,
    };

    if (type === 'topics') {
      // Reset lower levels when going up to 'topics'
      setSelectedTopicId(id);
      setSelectedSubTopicId(null);
      setSelectedChapterId(null);
      setSelectedGroupId(null);

      // Clear all lower-level data before making a new API call
      setSubTopics([]);
      setChapters([]);
      setSubChapters([]);
      setGroupList([]);

      setSelectedTitles({
        ...resetTitles,
        topics: studyMaterialTopics.find(t => t.id === id)?.name || Topics,
      });

      setExpandedTopics({...resetExpanded, subTopics: true});

      try {
        const response = await axios.post(api_link, {
          device_id: deviceId,
          lang_id: langId,
          sect_id: 1,
          cat_id: 8,
          subcat_id: 37,
          ee_topic_id: id,
        });
        const subTopicsData =
          response.data?.latest_Notification?.study_material || [];
        const extracted = subTopicsData.map(item => ({
          id: item.ee_sub_topic_id,
          name: item.ee_sub_topic_name,
        }));
        setSubTopics(extracted);
      } catch (err) {
        console.log('Failed to fetch subtopics:', err);
      }
    } else if (type === 'subTopics') {
      // Reset lower levels when going up to 'subTopics'
      setSelectedSubTopicId(id);
      setSelectedChapterId(null);
      setSelectedGroupId(null);

      // Clear all lower-level data before making a new API call
      setChapters([]);
      setSubChapters([]);
      setGroupList([]);

      setSelectedTitles({
        ...selectedTitles,
        subTopics: subTopics.find(s => s.id === id)?.name || SubTopics,
        chapters: Chapters,
        subChapters: SubChapters,
        studyMaterial: Group,
      });

      setExpandedTopics({...resetExpanded, chapters: true});

      try {
        const response = await axios.post(api_link, {
          device_id: deviceId,
          lang_id: langId,
          sect_id: 1,
          cat_id: 8,
          subcat_id: 37,
          ee_topic_id: selectedTopicId,
          ee_sub_topic_id: id,
        });
        const chaptersData =
          response.data?.latest_Notification?.study_material || [];
        const extracted = chaptersData.map(item => ({
          id: item.ee_chapt_id,
          name: item.ee_chapt_name,
        }));
        setChapters(extracted);
      } catch (err) {
        console.log('Failed to fetch chapters:', err);
      }
    } else if (type === 'chapters') {
      // Reset lower levels when going up to 'chapters'
      setSelectedChapterId(id);
      setSelectedGroupId(null);

      // Clear all lower-level data before making a new API call
      setSubChapters([]);
      setGroupList([]);

      setSelectedTitles({
        ...selectedTitles,
        chapters: chapters.find(c => c.id === id)?.name || Chapters,
        subChapters: SubChapters,
        studyMaterial: Group,
      });

      setExpandedTopics({...resetExpanded, subChapters: true});

      try {
        const response = await axios.post(api_link, {
          device_id: deviceId,
          lang_id: langId,
          sect_id: 1,
          cat_id: 8,
          subcat_id: 37,
          ee_topic_id: selectedTopicId,
          ee_sub_topic_id: selectedSubTopicId,
          ee_chapt_id: id,
        });
        const data = response.data?.latest_Notification?.study_material || [];
        const extracted = data.map(item => ({
          id: item.ee_sub_chapt_id,
          name: item.ee_sub_chapt_name,
          full_url: item.full_url,
        }));
        setSubChapters(extracted);
      } catch (err) {
        console.log('Failed to fetch subchapters:', err);
      }
    } else if (type === 'subChapters') {
      // Reset lower levels when going up to 'subChapters'
      setSelectedGroupId(id);
      setGroupList([]);

      setSelectedTitles({
        ...selectedTitles,
        subChapters: subChapters.find(s => s.id === id)?.name || SubChapters,
        studyMaterial: Group,
      });

      setExpandedTopics({...resetExpanded, studyMaterial: true});

      try {
        const response = await axios.post(api_link, {
          device_id: deviceId,
          lang_id: langId,
          year: 2019,
          sect_id: 1,
          cat_id: 8,
          subcat_id: 37,
          ee_topic_id: selectedTopicId,
          ee_sub_topic_id: selectedSubTopicId,
          ee_chapt_id: selectedChapterId,
          ee_sub_chapt_id: id,
        });

        const data = response.data?.latest_Notification?.study_material || [];
        setGroupList(data);
      } catch (err) {
        console.log('Failed to fetch study materials:', err);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!api_link) {
        console.log('API link not provided');
        return;
      }

      setLoading(true);

      try {
        const topicResponse = await axios.post(api_link, {
          device_id: deviceId,
          lang_id: langId,
          year: 2019,
          sect_id: 1,
          cat_id: 8,
          subcat_id: 37,
        });

        const topics =
          topicResponse.data?.latest_Notification?.study_material || [];
        const onlyTopics = topics.map(item => ({
          id: item.ee_topic_id,
          name: item.ee_topic_name_telugu,
        }));
        setStudyMaterialTopics(onlyTopics);
        let sect_id = 1001;
        if (activeTab === 'నమూనా ప్రశ్నపత్రాలు') sect_id = 1002; //Model Papers
        else if (activeTab === 'పాత ప్రశ్నపత్రాలు')
          sect_id = 1001; //Previous paper
        else if (activeTab === 'స్టడీ మెటీరియల్') sect_id = 1; // study Material

        const tabDataResponse = await axios.post(api_link, {
          device_id: deviceId,
          lang_id: langId,
          year: year,
          sect_id: sect_id,
          cat_id: 8,
          subcat_id: 37,
        });

        setData({
          'స్టడీ మెటీరియల్':
            tabDataResponse.data?.latest_Notification?.study_material || [], // Study Material
          'నమూనా ప్రశ్నపత్రాలు':
            tabDataResponse.data?.latest_Notification?.model_papers || [], // Model Paper
          'పాత ప్రశ్నపత్రాలు':
            tabDataResponse.data?.latest_Notification?.previous_papers || [], // Previous Paper
        });
      } catch (error) {
        console.log('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api_link, langId, year, activeTab]);

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.itemRow}
      //onPress={() => handleOpenPDF(item.spcat_link_pdf)}
      onPress={() =>
        navigation.navigate('CustomWebView', {
          url: item.spcat_link_pdf,
          title: null,
        })
      }>
      <Text style={styles.bullet}>{'\u25B6'}</Text>
      <Text style={styles.itemText}>{item.spcat_title_english}</Text>
    </TouchableOpacity>
  );

  useFocusEffect(
    React.useCallback(() => {
      setSelectedTitles({
        topics: Topics,
        subTopics: SubTopics,
        chapters: Chapters,
        subChapters: SubChapters,
        studyMaterial: Group,
      });

      // Collapse all accordions
      setExpandedTopics({
        topics: false,
        subTopics: false,
        chapters: false,
        subChapters: false,
        studyMaterial: false,
      });

      return () => {
        // cleanup if needed
      };
    }, []),
  );

  const renderStudyMaterial = () => {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 30}}>
        {/* 🔹 Topic Accordion */}
        <View style={styles.accordionBox}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleTopic('topics', 'topics')}>
            <Text style={styles.accordionTitle}>{selectedTitles.topics}</Text>
            <Text style={styles.accordionArrow}>
              {expandedTopics['topics'] ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          {expandedTopics['topics'] && (
            <View style={styles.accordionContent}>
              {studyMaterialTopics.length === 0 ? (
                <Text style={styles.noDataText}>No data available.</Text>
              ) : (
                studyMaterialTopics.map((topic, index) => (
                  <View key={topic.id + '-' + index}>
                    <TouchableOpacity
                      style={styles.subItem}
                      onPress={() => {
                        toggleTopic('topics', topic.id);
                        setSelectedTitles(prev => ({
                          ...prev,
                          topics: topic.name,
                        }));
                      }}>
                      <Text style={styles.subItemText}>{topic.name}</Text>
                    </TouchableOpacity>
                    {index < studyMaterialTopics.length - 1 && (
                      <View style={styles.divider} />
                    )}
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        {/* 🔹 SubTopic Accordion */}
        <View style={styles.accordionBox}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleTopic('subTopics', 'subTopics')}>
            <Text style={styles.accordionTitle}>
              {selectedTitles.subTopics}
            </Text>
            <Text style={styles.accordionArrow}>
              {expandedTopics['subTopics'] ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          {expandedTopics['subTopics'] && (
            <View style={styles.accordionContent}>
              {subTopics.length === 0 ? (
                <Text style={styles.noDataText}>No data available.</Text>
              ) : (
                subTopics.map((sub, index) => (
                  <View key={sub.id + '-' + index}>
                    <TouchableOpacity
                      style={styles.subItem}
                      onPress={() => {
                        toggleTopic('subTopics', sub.id);
                        setSelectedTitles(prev => ({
                          ...prev,
                          subTopics: sub.name,
                        }));
                      }}>
                      <Text style={styles.subItemText}>{sub.name}</Text>
                    </TouchableOpacity>
                    {index < subTopics.length - 1 && (
                      <View style={styles.divider} />
                    )}
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        {/* 🔹 Chapter Accordion */}
        <View style={styles.accordionBox}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleTopic('chapters', 'chapters')}>
            <Text style={styles.accordionTitle}>{selectedTitles.chapters}</Text>
            <Text style={styles.accordionArrow}>
              {expandedTopics['chapters'] ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          {expandedTopics['chapters'] && (
            <View style={styles.accordionContent}>
              {chapters.length === 0 ? (
                <Text style={styles.noDataText}>No data available.</Text>
              ) : (
                chapters.map((chapt, index) => (
                  <View key={chapt.id + '-' + index}>
                    <TouchableOpacity
                      style={styles.subItem}
                      onPress={() => {
                        toggleTopic('chapters', chapt.id);
                        setSelectedTitles(prev => ({
                          ...prev,
                          chapters: chapt.name,
                        }));
                      }}>
                      <Text style={styles.subItemText}>{chapt.name}</Text>
                    </TouchableOpacity>
                    {index < chapters.length - 1 && (
                      <View style={styles.divider} />
                    )}
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        {/* 🔹 SubChapter Accordion */}
        <View style={styles.accordionBox}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleTopic('subChapters', 'subChapters')}>
            <Text style={styles.accordionTitle}>
              {selectedTitles.subChapters}
            </Text>
            <Text style={styles.accordionArrow}>
              {expandedTopics['subChapters'] ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          {expandedTopics['subChapters'] && (
            <View style={styles.accordionContent}>
              {subChapters.length === 0 ? (
                <Text style={styles.noDataText}>No data available.</Text>
              ) : (
                subChapters.map((subChapt, index) => (
                  <View key={subChapt.id + '-' + index}>
                    <TouchableOpacity
                      style={styles.subItem}
                      onPress={() => {
                        setSelectedTitles(prev => ({
                          ...prev,
                          subChapters: subChapt.name,
                        }));

                        // Check if full_url exists and navigate
                        if (subChapt.full_url && subChapt.full_url !== '') {
                          navigation.navigate('CustomWebView', {
                            url: subChapt.full_url,
                            title: 'స్టడీ మెటీరియల్',
                          });
                        } else {
                          // Proceed with other actions if full_url doesn't exist
                          toggleTopic('subChapters', subChapt.id);
                        }
                      }}>
                      <Text style={styles.subItemText}>{subChapt.name}</Text>
                    </TouchableOpacity>
                    {index < subChapters.length - 1 && (
                      <View style={styles.divider} />
                    )}
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        {/* 🔹 Study Material Group Accordion */}
        {subChapters.every(sc => !sc.full_url) && ( // This will only render when NO subChapter has full_url
          <View style={styles.accordionBox}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() =>
                setExpandedTopics(prev => ({
                  ...prev,
                  studyMaterial: !prev.studyMaterial,
                }))
              }>
              <Text style={styles.accordionTitle}>
                {selectedTitles.studyMaterial}
              </Text>
              <Text style={styles.accordionArrow}>
                {expandedTopics['studyMaterial'] ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
            {expandedTopics['studyMaterial'] && (
              <View style={styles.accordionContent}>
                {groupList.length === 0 ? (
                  <Text style={styles.noDataText}>No data available.</Text>
                ) : (
                  groupList.map((material, index) => (
                    <View key={material.mm_group_id + '-' + index}>
                      <TouchableOpacity
                        style={styles.subItem}
                        onPress={() => {
                          setSelectedTitles(prev => ({
                            ...prev,
                            studyMaterial: material.mm_group_name_telugu,
                          }));
                          navigation.navigate('CustomWebView', {
                            url: material.full_url,
                            title: 'స్టడీ మెటీరియల్',
                          });
                        }}>
                        <Text style={styles.subItemText}>
                          {material.mm_group_name_telugu}
                        </Text>
                      </TouchableOpacity>
                      {index < groupList.length - 1 && (
                        <View style={styles.divider} />
                      )}
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabRow}>
        {Object.keys(data).map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabButton, activeTab === tab && styles.activeTab]}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Year Dropdown */}
      {activeTab === 'పాత ప్రశ్నపత్రాలు' && ( // Previous Paper
        <View style={{marginBottom: hp('2%')}}>
          <TouchableOpacity
            style={styles.dropdownToggle}
            onPress={() => setYearDropdownVisible(!yearDropdownVisible)}>
            <Text style={styles.dropdownText}>Year: {selectedYear}</Text>
          </TouchableOpacity>

          {yearDropdownVisible && (
            <View style={styles.dropdownContainer}>
              <FlatList
                data={yearList}
                keyExtractor={item => item.toString()}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedYear(item);
                      setYearDropdownVisible(false);
                    }}>
                    <Text style={styles.dropdownItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>
      )}
      {/* Content Area */}
      <View style={styles.contentBox}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#007bff"
            style={{alignSelf: 'center', top: '40%'}}
          />
        ) : data[activeTab]?.length === 0 && activeTab !== 'స్టడీ మెటీరియల్' ? ( // Study Material
          <Text style={styles.noDataText}>No data available.</Text>
        ) : activeTab === 'స్టడీ మెటీరియల్' ? ( // Study Material
          renderStudyMaterial()
        ) : (
          <FlatList
            data={data[activeTab]}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

export default DSC;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    padding: '15@ms',
    paddingTop: hp('4%'),
    backgroundColor: '#f5f5f5',
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: wp('3%'), // equal space on both sides
    //justifyContent: 'space-around',
    marginBottom: hp('4%'),
  },
  tabButton: {
    paddingVertical: hp('1%'),
    // backgroundColor: '#1E90FF', // Active tab color
    backgroundColor: '#1E90FF',
    paddingHorizontal: wp('0.5%'),
    borderRadius: '6@ms',
    alignItems: 'center',
    elevation: 4, // Add shadow to make the tab stand out
  },
  activeTab: {
    // backgroundColor: '#D32F2F', // Active tab color
    backgroundColor: '#00008b',
  },
  tabText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: '13@ms',
  },
  activeTabText: {
    color: '#ff0',
  },
  // contentBox: {
  //   flex: 1,
  //   backgroundColor: '#fff',
  //   borderRadius: '12@ms',
  //   padding: '12@ms',
  //   elevation: 2,
  //   marginTop: hp('1.5%'),
  //   shadowColor: '#000',
  //   shadowOpacity: 0.1,
  //   shadowRadius: 10,
  //   shadowOffset: {width: 0, height: 2}, // Light shadow effect for depth
  // },
  contentBox: {
    flex: 1,
    // backgroundColor: '#fff',
    borderRadius: '12@ms',
    padding: '12@ms',
    marginTop: hp('1.5%'),
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hp('1.5%'),
    backgroundColor: '#f9f9f9',
    padding: '10@ms',
    borderRadius: '8@ms',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 1},
  },
  bullet: {
    color: '#007bff',
    fontSize: '18@ms',
    marginRight: wp('2%'),
    marginTop: hp('0.3%'),
  },
  itemText: {
    flex: 1,
    fontSize: '14@ms',
    color: '#222',
    lineHeight: 20,
    flexWrap: 'nowrap',
  },
  noDataText: {
    textAlign: 'center',
    marginTop: hp('2%'),
    fontSize: '14@ms',
    color: '#999',
  },
  dropdownToggle: {
    backgroundColor: 'white',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
    borderRadius: '8@ms',
    elevation: 2,
    alignSelf: 'flex-start',
    marginBottom: hp('1%'),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
  },
  dropdownText: {
    fontSize: '14@ms',
    color: '#000',
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderRadius: '8@ms',
    elevation: 3,
    marginTop: hp('1%'),
    maxHeight: hp('30%'),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 3},
  },
  dropdownItem: {
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  dropdownItemText: {
    fontSize: '13@ms',
    color: '#333',
  },
  accordionBox: {
    marginBottom: hp('1.5%'),
    backgroundColor: '#fff',
    borderRadius: '10@ms',
    overflow: 'hidden',
    elevation: 3, // Add shadow for the accordion box
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12@ms',
    backgroundColor: '#ddd',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd', // Divider for the header
  },
  accordionTitle: {
    fontSize: '16@ms',
    color: '#333',
    fontWeight: '600',
  },
  accordionArrow: {
    fontSize: '16@ms',
    color: '#888',
  },
  accordionContent: {
    padding: '10@ms',
    backgroundColor: '#f8f8f8',
  },
  subItem: {
    paddingVertical: '8@ms',
    paddingLeft: '20@ms', // Add padding for sub-items
  },
  subItemText: {
    fontSize: '14@ms',
    color: '#555',
  },
  divider: {
    height: 1,
    backgroundColor: '#d3d3d3', // light gray, adjust as needed
    marginVertical: 5,
  },
});

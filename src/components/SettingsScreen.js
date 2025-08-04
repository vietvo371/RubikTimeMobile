import { wp, hp } from '../utils/responsive';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ed3126',
    },
    header: {
        paddingTop: hp('2.5%'),
        paddingBottom: hp('2.5%'),
        paddingHorizontal: wp('4%'),
        borderBottomLeftRadius: wp('5%'),
        borderBottomRightRadius: wp('5%'),
    },
    backText: {
        fontSize: wp('5%'),
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
        padding: wp('5%'),
        margin: wp('3.5%'),
        borderRadius: wp('4%'),
    },
    settingLabel: {
        fontSize: wp('4%'),
        marginBottom: hp('1%'),
    },
    settingInput: {
        fontSize: wp('4%'),
        paddingVertical: hp('1%'),
    },
    saveButton: {
        paddingVertical: hp('1.5%'),
        borderRadius: wp('2%'),
        marginTop: hp('1.5%'),
    },
}); 